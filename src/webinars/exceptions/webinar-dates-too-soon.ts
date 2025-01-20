export class WebinarDatesTooSoonException extends Error {
  constructor() {
    super('Webinar must be scheduled at least 3 days in advance');
    this.name = 'WebinarDatesTooSoonException';
  }
}
