export async function uploadErrorMessage(response: Response): Promise<string> {
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  if (payload?.error) return payload.error;

  if (response.status === 502) {
    return "Upload API сервертэй холбогдохгүй байна (502). Server/Nginx тохиргоог шалгана уу.";
  }

  if (response.status === 413) {
    return "Зургийн хэмжээ server-ийн зөвшөөрсөн хэмжээнээс их байна.";
  }

  return `Upload API алдаа (${response.status}).`;
}
