<script setup>
// Replace with your real business number, in international format, no + or leading zeros.
// e.g. Kenyan number 0712 345 678 -> 254712345678
const WHATSAPP_NUMBER = '254791018109'
const DEFAULT_MESSAGE = "Hi, I'm interested in a property listed on Tawi Properties."

const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`
</script>

<template>
  <Teleport to="body">
    <a
      :href="whatsappHref"
      class="whatsapp-fab"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path
          d="M16.004 3C9.376 3 4 8.373 4 15c0 2.362.687 4.564 1.872 6.42L4 29l7.77-1.84A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm0 21.75c-1.86 0-3.6-.5-5.1-1.37l-.365-.213-4.61 1.09 1.113-4.49-.238-.375A9.71 9.71 0 0 1 5.25 15c0-5.928 4.826-10.75 10.754-10.75S26.75 9.072 26.75 15 21.928 24.75 16.004 24.75z"
        />
        <path
          d="M21.62 17.53c-.303-.152-1.792-.884-2.07-.985-.278-.102-.48-.152-.683.152s-.78.985-.957 1.187-.354.228-.657.076c-.303-.152-1.278-.47-2.435-1.502-.9-.803-1.508-1.796-1.685-2.098-.177-.303-.019-.466.133-.617.137-.136.303-.354.455-.531.152-.177.202-.303.303-.505.101-.202.05-.38-.025-.532-.076-.152-.683-1.646-.936-2.253-.247-.593-.498-.513-.683-.522-.177-.008-.38-.01-.582-.01a1.12 1.12 0 0 0-.81.38c-.278.303-1.06 1.036-1.06 2.526s1.085 2.93 1.237 3.132c.152.202 2.135 3.26 5.174 4.572.723.312 1.287.499 1.727.638.725.23 1.385.198 1.907.12.582-.087 1.792-.732 2.045-1.44.253-.708.253-1.314.177-1.44-.076-.127-.278-.202-.582-.354z"
        />
      </svg>
    </a>
  </Teleport>
</template>

<style>
.whatsapp-fab {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  left: auto !important;
  top: auto !important;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #25d366;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.2);
  z-index: 2147483647;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.whatsapp-fab:hover,
.whatsapp-fab:focus-visible {
  transform: scale(1.08);
  box-shadow: 0 20px 52px rgba(0, 0, 0, 0.3);
}

.whatsapp-fab:active {
  transform: scale(0.96);
}

@media (max-width: 600px) {
  .whatsapp-fab {
    bottom: 16px !important;
    right: 16px !important;
    width: 52px;
    height: 52px;
  }
}
</style>