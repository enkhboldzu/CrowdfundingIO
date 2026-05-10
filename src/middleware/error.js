function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);

  if (err.code === "P2002") {
    return res.status(409).json({ error: "Давхардсан утга байна" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Мэдээлэл олдсонгүй" });
  }

  const status = err.status ?? err.statusCode ?? 500;
  res.status(status).json({
    error: err.message ?? "Серверийн алдаа гарлаа",
  });
}

module.exports = { errorHandler };
