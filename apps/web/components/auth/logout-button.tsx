"use client";

export function LogoutButton() {
  function handleLogout() {
    localStorage.removeItem("tendermind_access_token");
    localStorage.removeItem("tendermind_user_email");
    document.cookie = "tendermind_access_token=; Max-Age=0; Path=/; SameSite=Lax";
    window.location.replace("/login");
  }

  return (
    <button
      type="button"
      className="button-secondary"
      onClick={handleLogout}
      style={{ border: "none", cursor: "pointer", minHeight: 36, padding: "0 14px" }}
    >
      Logout
    </button>
  );
}
