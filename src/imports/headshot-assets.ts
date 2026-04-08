// ── Avatar Asset Bridge ────────────────────────────────────────────
// Maps each team member to a production-safe, locally-hosted avatar.
//
// In Figma Make dev: the figma:asset imports are resolved by Figma's
// built-in asset handler and return the real cropped headshot PNGs.
//
// In production builds (vite build → Netlify): the figmaAssetPlugin in
// vite.config.ts intercepts figma:asset/ imports and resolves them to
// the matching file from /public/avatars/ via the AVATAR_MANIFEST.
//
// This dual-path approach ensures pixel-perfect fidelity in the Figma
// editor and zero broken images on the deployed Netlify site.

import imgTaylor from "figma:asset/a56f8031b24a6448a073e451604538a99b8c6304.png";
import imgTori from "figma:asset/143f6a69c403a3260602fe5ec84bfa9d4dcea7dc.png";
import imgJake from "figma:asset/58787c6b18d29e16e4befd3097bb9bc4d9e15bdd.png";
import imgKelly from "figma:asset/9063a7dd6c4592d04c38d2d3de64c1d99245ba07.png";
import imgKayla from "figma:asset/8e3d275f2f8acfbb1ad51a8d9b7c6100e380c4e6.png";
import imgJoy from "figma:asset/2de9c2bf40ba1a30193c412a5a594fd9ce79e143.png";
import imgJen from "figma:asset/358fa06ae076026179b0b680397fc74976165545.png";
import imgRachel from "figma:asset/bed871db41b79f68ec909f66b0a07252a0f9c07f.png";
import imgMiranda from "figma:asset/f3696d74b99cdc9f581723b53ab0d455420e28ba.png";
import imgCarson from "figma:asset/5e1188ac9fe17e763ef3118520e6a5f43494af32.png";
import imgJack from "figma:asset/8359c15443eead0680b8d8b48af73270dc0109db.png";
import imgBen from "figma:asset/ab7d53b7a6327ae29caa6533f382b9704182d5ba.png";
import imgBrittney from "figma:asset/1a6733453f26c6fa0e496a28159a87504a26446a.png";
import imgRebecca from "figma:asset/e1aecd8025be48cfe7449eaa364773fd0c49a264.png";

export {
  imgTaylor,
  imgTori,
  imgJake,
  imgKelly,
  imgKayla,
  imgJoy,
  imgJen,
  imgRachel,
  imgMiranda,
  imgCarson,
  imgJack,
  imgBen,
  imgBrittney,
  imgRebecca,
};
