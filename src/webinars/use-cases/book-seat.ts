import { IMailer } from 'src/core/ports/mailer.interface';
import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { Participation } from 'src/webinars/entities/participation.entity';
import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';
import { WebinarNotEnoughSeatsException } from 'src/webinars/exceptions/webinar-not-enough-seats';
import { WebinarUserAlreadyParticipatingException } from 'src/webinars/exceptions/webinar-user-already-participating';

type Request = {
  webinarId: string;
  user: User;
};

export class BookSeat implements Executable<Request, void> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly webinarRepository: IWebinarRepository,
    private readonly mailer: IMailer,
  ) {}

  async execute({ webinarId, user }: Request): Promise<void> {
    // Récupérer le webinaire par son ID
    const webinar = await this.webinarRepository.findById(webinarId);
    if (!webinar) {
      throw new Error('Webinar not found');
    }

    // Récupérer les participations pour ce webinaire
    const participations =
      await this.participationRepository.findByWebinarId(webinarId);

    // Vérifier s'il reste des places disponibles
    if (participations.length >= webinar.props.seats) {
      throw new WebinarNotEnoughSeatsException();
    }

    // Vérifier si l'utilisateur participe déjà à ce webinaire
    const isAlreadyParticipating = participations.some(
      (participation) => participation.props.userId === user.props.id,
    );
    if (isAlreadyParticipating) {
      throw new WebinarUserAlreadyParticipatingException();
    }

    // Créer une nouvelle participation
    const participation = new Participation({
      userId: user.props.id,
      webinarId: webinarId,
    });

    // Enregistrer la participation
    await this.participationRepository.save(participation);

    // Envoyer un email à l'organisateur pour l'informer de la nouvelle inscription
    await this.mailer.send({
      to: webinar.props.organizerId,
      subject: 'New participant registered',
      body: `User ${user.props.email} has registered for the webinar ${webinar.props.title}.`,
    });
  }
}
