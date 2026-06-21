export class LastInspectedAfterInstalledRule {
  constructor(
    private readonly installedAt: string,
    private readonly lastInspectedAt: string | null,
  ) {}

  isBroken(): boolean {
    return this.lastInspectedAt !== null && this.lastInspectedAt.localeCompare(this.installedAt) < 0;
  }
}
