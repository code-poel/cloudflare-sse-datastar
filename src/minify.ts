export default function minifyHtml(html: string): string {
	return html
		// Preserve comments
		.replace(/<!--[\s\S]*?-->/g, match => match)
		// Remove whitespace between tags
		.replace(/>\s+</g, '><')
		// Remove whitespace at start and end of lines
		.replace(/^\s+|\s+$/gm, '')
		// Remove multiple spaces
		.replace(/\s+/g, ' ')
		// Preserve spaces between attributes
		.replace(/(\w+)\s*=\s*(["'])(.*?)\2/g, '$1=$2$3$2');
}