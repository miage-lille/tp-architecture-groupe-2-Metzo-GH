export abstract class Entity<TEntity> {
  public props: TEntity;
  public initialState: TEntity;
  constructor(data: TEntity) {
    this.initialState = { ...data };
    this.props = { ...data };

    Object.freeze(this.initialState);
  }

  update(data: Partial<TEntity>): void {
    this.props = { ...this.props, ...data };
  }

  commit(): void {
    this.initialState = this.props;
  }
}
