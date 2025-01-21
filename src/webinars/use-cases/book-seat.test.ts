import { InMemoryMailer } from 'src/core/adapters/in-memory-mailer';
import { IMailer } from 'src/core/ports/mailer.interface';
import { User } from 'src/users/entities/user.entity';
import { InMemoryWebinarParticipationRepository } from 'src/webinars/adapters/webinar-participation-repository.in-memory';
import { InMemoryWebinarRepository } from 'src/webinars/adapters/webinar-repository.in-memory';
import { Participation } from 'src/webinars/entities/participation.entity';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { BookSeat } from 'src/webinars/use-cases/book-seat';
import { WebinarUserAlreadyParticipatingException } from 'src/webinars/exceptions/webinar-user-already-participating';
import { WebinarNotEnoughSeatsException } from 'src/webinars/exceptions/webinar-not-enough-seats';

describe('Feature: Book a seat', () => {
  let webinarParticipationRepository: InMemoryWebinarParticipationRepository;
  let webinarRepository: InMemoryWebinarRepository;
  let mailer: IMailer;
  let useCase: BookSeat;

  const user = new User({
    id: 'user-1',
    email: 'user1@example.com',
    password: 'password',
  });
  const webinar = new Webinar({
    id: 'webinar-1',
    organizerId: 'organizer-1',
    title: 'Webinar title',
    startDate: new Date('2024-01-10T10:00:00.000Z'),
    endDate: new Date('2024-01-10T11:00:00.000Z'),
    seats: 2,
  });

  beforeEach(() => {
    webinarParticipationRepository =
      new InMemoryWebinarParticipationRepository();
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    mailer = new InMemoryMailer();
    useCase = new BookSeat(
      webinarParticipationRepository,
      webinarRepository,
      mailer,
    );
  });

  describe('Scenario: happy path', () => {
    it('should book a seat', async () => {
      await useCase.execute({ webinarId: 'webinar-1', user });

      const participations =
        await webinarParticipationRepository.findByWebinarId('webinar-1');
      expect(participations).toHaveLength(1);
      expect(participations[0].props.userId).toBe('user-1');
    });

    it('should send an email to the organizer', async () => {
      await useCase.execute({ webinarId: 'webinar-1', user });

      expect((mailer as InMemoryMailer).sentEmails).toHaveLength(1);
      expect((mailer as InMemoryMailer).sentEmails[0].to).toBe('organizer-1');
      expect((mailer as InMemoryMailer).sentEmails[0].subject).toBe(
        'New participant registered',
      );
      expect((mailer as InMemoryMailer).sentEmails[0].body).toContain(
        'user1@example.com',
      );
    });
  });

  describe('Scenario: no seats left', () => {
    it('should throw an error', async () => {
      await webinarParticipationRepository.save(
        new Participation({ userId: 'user-2', webinarId: 'webinar-1' }),
      );
      await webinarParticipationRepository.save(
        new Participation({ userId: 'user-3', webinarId: 'webinar-1' }),
      );

      await expect(
        useCase.execute({ webinarId: 'webinar-1', user }),
      ).rejects.toThrow(WebinarNotEnoughSeatsException);
    });
  });

  describe('Scenario: user already participating', () => {
    it('should throw an error', async () => {
      await webinarParticipationRepository.save(
        new Participation({ userId: 'user-1', webinarId: 'webinar-1' }),
      );

      await expect(
        useCase.execute({ webinarId: 'webinar-1', user }),
      ).rejects.toThrow(WebinarUserAlreadyParticipatingException);
    });
  });
});
