export async function uploadImageFile(file: File): Promise<string> {
	const form = new FormData();
	form.append('image', file);

	const response = await fetch('/api/upload', {
		method: 'POST',
		body: form
	});

	if (!response.ok) {
		throw new Error('Failed to upload image');
	}

	const data = (await response.json()) as { url: string };
	return data.url;
}


