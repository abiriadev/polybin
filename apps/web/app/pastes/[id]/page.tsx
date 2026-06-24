import PasteView from './paste-view'

// `output: export` requires a dynamic route to enumerate its params at build
// time. Paste ids are created at runtime, so we build a single placeholder
// shell and serve it for any id via the CF Pages rewrite in
// `public/_redirects` (`/pastes/* -> /pastes/placeholder`). The client reads
// the real id from the URL.
export const generateStaticParams = () => [{ id: 'placeholder' }]

export default function Page() {
	return <PasteView />
}
