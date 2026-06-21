type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading' }: LoadingStateProps): JSX.Element {
  return <p className="m-5 text-slate-500">{label}</p>;
}
