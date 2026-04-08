// ── Headshots Figma Frame (original import) ────────────────────────
// Uses the shared headshot-assets bridge so all avatar references
// resolve through the same figma:asset → AVATAR_MANIFEST → /avatars/
// pipeline.  No duplicate figma:asset imports.

import {
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
} from "./headshot-assets";

function Jake() {
  return (
    <div className="absolute left-[800px] size-[760px] top-0" data-name="Jake">
      <div className="absolute left-0 size-[760px] top-0" data-name="Jake 1">
        <img alt="Jake" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgJake} loading="eager" decoding="sync" />
      </div>
    </div>
  );
}

function Tori() {
  return (
    <div className="absolute left-[1600px] size-[760px] top-0" data-name="Tori">
      <div className="absolute left-0 size-[760px] top-0" data-name="Tori 1">
        <img alt="Tori" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTori} loading="eager" decoding="sync" />
      </div>
    </div>
  );
}

function Brittney() {
  return (
    <div className="absolute left-[2400px] size-[760px] top-0" data-name="Brittney">
      <div className="absolute left-0 size-[760px] top-0" data-name="Brittney 1">
        <img alt="Brittney" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgBrittney} loading="eager" decoding="sync" />
      </div>
    </div>
  );
}

function Rebecca() {
  return (
    <div className="absolute left-[3200px] size-[760px] top-0" data-name="Rebecca">
      <div className="absolute left-0 size-[760px] top-0" data-name="Rebecca 1">
        <img alt="Rebecca" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRebecca} loading="eager" decoding="sync" />
      </div>
    </div>
  );
}

function Taylor() {
  return (
    <div className="absolute left-0 size-[760px] top-0" data-name="Taylor">
      <div className="absolute left-0 size-[760px] top-0" data-name="Taylor 1">
        <img alt="Taylor" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTaylor} loading="eager" decoding="sync" />
      </div>
    </div>
  );
}

function Kelly() {
  return (
    <div className="absolute left-0 size-[760px] top-[800px]" data-name="Kelly">
      <div className="absolute left-0 size-[760px] top-0" data-name="Kelly 1">
        <img alt="Kelly" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgKelly} loading="eager" decoding="sync" />
      </div>
    </div>
  );
}

function Kayla() {
  return (
    <div className="absolute left-[800px] size-[760px] top-[800px]" data-name="Kayla">
      <div className="absolute left-0 size-[760px] top-0" data-name="Kayla 1">
        <img alt="Kayla" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgKayla} loading="eager" decoding="sync" />
      </div>
    </div>
  );
}

function Rachel() {
  return (
    <div className="absolute left-[1600px] size-[760px] top-[800px]" data-name="Rachel">
      <div className="absolute left-0 size-[760px] top-0" data-name="Rachel 1">
        <img alt="Rachel" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRachel} loading="eager" decoding="sync" />
      </div>
    </div>
  );
}

function Miranda() {
  return (
    <div className="absolute left-0 size-[760px] top-[1600px]" data-name="Miranda">
      <div className="absolute left-0 size-[760px] top-0" data-name="Miranda 1">
        <img alt="Miranda" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgMiranda} loading="eager" decoding="sync" />
      </div>
    </div>
  );
}

function Carson() {
  return (
    <div className="absolute left-[800px] size-[760px] top-[1600px]" data-name="Carson">
      <div className="absolute left-0 size-[760px] top-0" data-name="Carson 1">
        <img alt="Carson" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgCarson} loading="eager" decoding="sync" />
      </div>
    </div>
  );
}

function Jack() {
  return (
    <div className="absolute left-[1600px] size-[760px] top-[1600px]" data-name="Jack">
      <div className="absolute left-0 size-[760px] top-0" data-name="Jack 1">
        <img alt="Jack" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgJack} loading="eager" decoding="sync" />
      </div>
    </div>
  );
}

function Joy() {
  return (
    <div className="absolute left-[2400px] size-[760px] top-[1600px]" data-name="Joy">
      <div className="absolute left-0 size-[760px] top-0" data-name="Joy 1">
        <img alt="Joy" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgJoy} loading="eager" decoding="sync" />
      </div>
    </div>
  );
}

function Jen() {
  return (
    <div className="absolute left-0 size-[760px] top-[2400px]" data-name="Jen">
      <div className="absolute left-0 size-[760px] top-0" data-name="Jen 1">
        <img alt="Jen" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgJen} loading="eager" decoding="sync" />
      </div>
    </div>
  );
}

function Ben() {
  return (
    <div className="absolute left-[800px] size-[760px] top-[2400px]" data-name="Ben">
      <div className="absolute left-0 size-[760px] top-0" data-name="Ben 1">
        <img alt="Ben" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgBen} loading="eager" decoding="sync" />
      </div>
    </div>
  );
}

export default function Headshots() {
  return (
    <div className="relative size-full" data-name="Headshots">
      <Jake />
      <Tori />
      <Brittney />
      <Rebecca />
      <Taylor />
      <Kelly />
      <Kayla />
      <Rachel />
      <Miranda />
      <Carson />
      <Jack />
      <Joy />
      <Jen />
      <Ben />
    </div>
  );
}