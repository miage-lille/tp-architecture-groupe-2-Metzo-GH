import { Participation } from 'src/webinars/entities/participation.entity';
import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';

export class InMemoryWebinarParticipationRepository
  implements IParticipationRepository
{
  private readonly database: Participation[] = [];

  async findByWebinarId(webinarId: string): Promise<Participation[]> {
    return this.database.filter(
      (participation) => participation.props.webinarId === webinarId,
    );
  }

  async save(participation: Participation): Promise<void> {
    this.database.push(participation);
  }
}
