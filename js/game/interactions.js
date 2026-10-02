export function shuffle(array){ return [...array].sort(()=>Math.random()-0.5); }

export function deviceCard(device, selectable=true){
  return `<button class="device-card image-card" data-device="${device.id}" ${selectable?'':'disabled'} draggable="true">
    <span class="asset-frame"><img src="${device.image}" alt="${device.name}" loading="lazy"></span>
    <b>${device.name}</b>
  </button>`;
}

export function scoreFrom(correct,total){ return total ? Math.round((correct/total)*100) : 0; }
