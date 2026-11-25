type Catalog = { subject: string; units: { id: string; unit: string }[] }[];

/** 관심사 이름표(너비56)가 겹치지 않도록 각 과목을 한 줄에 놓는다. */
export function notebookPath(catalog: Catalog, width=340) {
  const rowHeight=132;
  return {
    width, height: Math.max(1,catalog.length)*rowHeight,
    groups: catalog.map((s,row)=>({
      subject:s.subject, headingY:row*rowHeight+16,
      points:s.units.map((u,i)=>({
        ...u, x:width/(s.units.length+1)*(i+1), y:row*rowHeight+84+Math.sin(i*.9)*8,
      })),
    })),
  };
}
