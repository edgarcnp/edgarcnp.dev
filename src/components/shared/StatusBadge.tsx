import type { ProjectStatus } from '~/lib/types';
import { STATUS_CLASSES } from '~/lib/types';

interface Props {
  status: ProjectStatus;
}

export default function StatusBadge(props: Props) {
  return (
    <span class={STATUS_CLASSES[props.status]}>
      {props.status}
    </span>
  );
}
