type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps): JSX.Element {
  return <p className="m-5 text-slate-500">{message}</p>;
}
