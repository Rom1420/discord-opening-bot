

export function getInspectLink(item, asset) {
  // 1) Dans descriptions.actions
  if (item.actions?.length) {
    const act = item.actions.find(a => a.name.includes("Inspect"));
    if (act) return act.link;
  }

  // 2) Dans descriptions.market_actions
  if (item.market_actions?.length) {
    const act = item.market_actions.find(a => a.name.includes("Inspect"));
    if (act) return act.link;
  }

  // 3) Dans asset.actions ou asset.market_actions (rare mais existe)
  if (asset?.actions?.length) {
    const act = asset.actions.find(a => a.name.includes("Inspect"));
    if (act) return act.link;
  }

  if (asset?.market_actions?.length) {
    const act = asset.market_actions.find(a => a.name.includes("Inspect"));
    if (act) return act.link;
  }

  // Aucun inspect trouvé
  return null;
}