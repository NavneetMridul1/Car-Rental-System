function decodeToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payloadJson = atob(parts[1]);
    return JSON.parse(payloadJson);
  } catch (error) {
    return null;
  }
}

function getCurrentRole() {
  const payload = decodeToken();
  return payload?.role || null;
}

function getCurrentUserId() {
  const payload = decodeToken();
  return payload?.userId || null;
}

function logout() {
  localStorage.removeItem("token");
  window.location.replace("./cars.html");
}
