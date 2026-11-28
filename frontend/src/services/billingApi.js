import { BACKEND_URL } from "../config/apiConfig";

export async function fetchPlans() {
  const res = await fetch(`${BACKEND_URL}/api/billing/plans`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to load plans");
  return data;
}

export async function fetchBillingStatus(token) {
  const activeToken = token || localStorage.getItem("accessToken") || "";
  const res = await fetch(`${BACKEND_URL}/api/billing/status`, {
    headers: { Authorization: `Bearer ${activeToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to load billing status");
  return data;
}

export async function createRazorpayOrder(token, planId) {
  const activeToken = token || localStorage.getItem("accessToken") || "";
  const res = await fetch(`${BACKEND_URL}/api/billing/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${activeToken}`,
    },
    body: JSON.stringify({ planId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to create Razorpay order");
  return data;
}

export async function verifyRazorpayPayment(token, payload) {
  const activeToken = token || localStorage.getItem("accessToken") || "";
  const res = await fetch(`${BACKEND_URL}/api/billing/verify-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${activeToken}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Payment verification failed");
  return data;
}

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout({
  token,
  planId,
  user,
  onSuccess,
  onError,
}) {
  try {
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      throw new Error("Could not load Razorpay Checkout SDK. Please check your internet connection.");
    }

    const orderData = await createRazorpayOrder(token, planId);

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "VocodeAI",
      description: `VocodeAI ${orderData.plan?.name || planId} Plan (Monthly)`,
      image: "/icon.png",
      order_id: orderData.orderId,
      prefill: {
        name: user
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || ""
          : "",
        email: user?.email || "",
        contact: user?.phone || "",
      },
      theme: {
        color: "#43E65C",
      },
      handler: async (response) => {
        try {
          const verified = await verifyRazorpayPayment(token, {
            ...response,
            planId,
          });
          if (verified?.user) {
            localStorage.setItem("user", JSON.stringify(verified.user));
            window.dispatchEvent(
              new CustomEvent("vocode_auth_sync", {
                detail: { user: verified.user },
              })
            );
          }
          onSuccess?.(verified);
        } catch (verifyErr) {
          onError?.(verifyErr);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (resp) => {
      onError?.(new Error(resp?.error?.description || "Payment failed"));
    });
    rzp.open();
  } catch (err) {
    onError?.(err);
  }
}
