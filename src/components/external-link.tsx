import type { SetRequired } from 'type-fest'

export function ExternalLink(props: SetRequired<React.ComponentProps<'a'>, 'href'>) {
	return <a target="_blank" rel="noreferrer noopener" {...props} />
}
