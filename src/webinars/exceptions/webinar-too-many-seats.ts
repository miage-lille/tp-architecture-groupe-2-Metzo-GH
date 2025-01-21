export class WebinarTooManySeatsException extends Error {
  constructor() {
    super('Webinar must have at most 1000 seats');
    this.name = 'WebinarTooManySeatsException';
  }
}
