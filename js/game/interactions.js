export function shuffle(array){ return [...array].sort(()=>Math.random()-0.5); }

export function deviceCard(device, selectable=true){
  return `<button class="device-card" data-device="${device.id}" ${selectable?'':'disabled'}><span class="device-icon">${device.icon}</span><b>${device.name}</b></button>`;
}
