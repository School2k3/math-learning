export async function uploadImageFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);

  const response = await fetch("/api/upload/image", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

export async function uploadVideoFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("video", file);

  const response = await fetch("/api/upload/video", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error("Failed to upload video");
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

export async function uploadAudioFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("audio", file);

  const response = await fetch("/api/upload/audio", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error("Failed to upload audio");
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}
