class Task {
  ticksLeft: number;
  func?: (...args: any[]) => Promise<void>;
  id: number;
  promise: Promise<Task> | undefined;
  frequency?: number; // Used for setInterval
  private static taskIdCount = 0;

  constructor(ticksLeftIn: number, funcIn?: (...args: any[]) => Promise<void>) {
    this.ticksLeft = ticksLeftIn;
    this.func = funcIn;

    this.id = Task.taskIdCount++;
  }

  _resolver: ((value: Task | PromiseLike<Task>) => void) | undefined;
  _rejector: ((reason?: any) => void) | undefined;

  _promiseHandler(resolve: (value: Task | PromiseLike<Task>) => void, reject: (reason?: any) => void) {
    this._resolver = resolve;
    this._rejector = reject;
  }
}

/**
 * A stack to maintain functions scheduled by setInterval and setTimeout
 */
export class TimedQueue {
  private tasks: Task[] = [];

  /**
   * setTimeout implementation using ticks to delay a function call
   * @param fn a function to be run after a delay
   * @param delay The duration of time to wait before running the function (note that a tick is 50 milliseconds)
   * @returns a number between 1 and 10000 that can be used to cancel the task
   */
  setTimeout(fn?: () => any, duration?: number): Promise<Task> {
    if (!duration) {
      duration = 50;
    }

    let task = new Task(Math.floor(duration / 50), fn);

    task.promise = new Promise<Task>(task._promiseHandler.bind(task));

    // console.warn(`pushing task ${task.id} on the stack with ${task.ticksLeft} ticks left`);

    this.tasks.push(task);

    return task.promise;
  }

  sleep(duration: number): Promise<Task> {
    return this.setTimeout(undefined, duration);
  }

  /**
   * Clears the timed out function from the stack
   * @param taskProm the id of the task to cancel
   */
  clearTimeout(taskProm: Promise<Task>) {
    this.tasks = this.tasks.filter((task) => task.promise !== taskProm);
  }

  /**
   * setInterval implementation using ticks to run a function on a regular interval
   * @param fn a function to be run on a certain frequency
   * @param frequency The frequency in which to run the function in milliseconds (note that a tick is 50 milliseconds)
   * @returns
   */
  setInterval(fn: () => any, frequency: number) {
    console.warn(`setting interval for ${frequency}`);

    let task = new Task(Math.floor(frequency / 50), fn);

    task.frequency = Math.floor(frequency / 50);

    // console.warn(`pushing task ${task.id} on the stack with ${task.ticksLeft} ticks left`);
    this.tasks.push(task);

    return task.id;
  }

  /**
   * Clears the interval function from the stack
   * @param id the id of the task to cancel
   */
  clearInterval(id: number) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
  }

  /**
   * Runs once every tick. Used to update the task stack (to support setInterval and setTimeout)
   */
  async processTick() {
    //update the task stack
    for (let i = 0; i < this.tasks.length; i++) {
      let task = this.tasks[i];
      task.ticksLeft--;

      if (task.ticksLeft <= 0) {
        if (task.func) await task.func();

        if (task._resolver) {
          task._resolver(task);
        }

        if (task.frequency) {
          task.ticksLeft = task.frequency;
        } else {
          this.tasks.splice(i, 1);
          i--;
        }
      }
    }
  }
}
