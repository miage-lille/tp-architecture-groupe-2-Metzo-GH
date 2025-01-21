export class WebinarNotEnoughSeatsException extends Error {
  constructor() {
    super('Webinar must have at least 1 seat');
    this.name = 'WebinarNotEnoughSeatsException';
  }
}
