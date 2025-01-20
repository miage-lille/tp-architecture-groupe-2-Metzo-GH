import { IDateGenerator } from 'src/core/ports/date-generator.interface';
import { IIdGenerator } from 'src/core/ports/id-generator.interface';
import { Executable } from 'src/shared/executable';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { WebinarDatesTooSoonException } from 'src/webinars/exceptions/webinar-dates-too-soon';
import { WebinarNotEnoughSeatsException } from 'src/webinars/exceptions/webinar-not-enough-seats';
import { WebinarTooManySeatsException } from 'src/webinars/exceptions/webinar-too-many-seats';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';

type Request = {
  userId: string;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

type Response = { id: string };

export class OrganizeWebinars implements Executable<Request, Response> {
  constructor(
    private readonly webinarRepository: IWebinarRepository,
    private readonly idGenerator: IIdGenerator,
    private readonly dateGenerator: IDateGenerator,
  ) {}

  async execute(data: Request) {
    const id = this.idGenerator.generate();

    const webinar = new Webinar({
      id,
      organizerId: data.userId,
      title: data.title,
      startDate: data.startDate,
      endDate: data.endDate,
      seats: data.seats,
    });
    if (webinar.isTooSoon(this.dateGenerator.now())) {
      throw new WebinarDatesTooSoonException();
    }
    if (webinar.hasTooManySeats()) {
      throw new WebinarTooManySeatsException();
    }

    if (webinar.hasNotEnoughSeats()) {
      throw new WebinarNotEnoughSeatsException();
    }

    await this.webinarRepository.create(webinar);

    return { id };
  }
}
