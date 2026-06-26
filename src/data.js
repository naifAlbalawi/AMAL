export const TODAY = new Date("2026-06-17");
export const fmtDate = d => d.toISOString().slice(0,10);

export const RECORDS = {
  consumables: [
    { id:"c1", name:"Deodorant",     price:4.50, bought:"2026-05-01", duration:45, ends:"2026-06-15", monthly:3.0,  status:"Low",  color:"#3B5BDB" },
    { id:"c2", name:"Toothpaste",    price:3.20, bought:"2026-05-10", duration:60, ends:"2026-07-09", monthly:1.6,  status:"OK",   color:"#3B5BDB" },
    { id:"c3", name:"Shampoo",       price:7.00, bought:"2026-04-20", duration:50, ends:"2026-06-09", monthly:4.2,  status:"Low",  color:"#3B5BDB" },
    { id:"c4", name:"Body Wash",     price:5.50, bought:"2026-05-15", duration:55, ends:"2026-07-09", monthly:3.0,  status:"OK",   color:"#3B5BDB" },
    { id:"c5", name:"Razor Blades",  price:12.0, bought:"2026-05-01", duration:90, ends:"2026-07-30", monthly:4.0,  status:"OK",   color:"#3B5BDB" },
  ],
  durables: [
    { id:"d1", name:"Running Shoes", price:120,  bought:"2026-01-15", ends:"2027-01-15", monthly:9.9,  status:"Good", color:"#2F9E44" },
    { id:"d2", name:"Winter Jacket", price:85,   bought:"2025-11-01", ends:"2027-11-01", monthly:3.5,  status:"Good", color:"#2F9E44" },
    { id:"d3", name:"Work Trousers", price:45,   bought:"2026-03-10", ends:"2027-03-10", monthly:3.75, status:"Good", color:"#2F9E44" },
    { id:"d4", name:"Backpack",      price:60,   bought:"2025-06-01", ends:"2027-06-01", monthly:2.5,  status:"Worn", color:"#2F9E44" },
  ],
  car: [
    { id:"v1", name:"Oil Change",     date:"2026-03-15", ends:"2026-09-15", cost:55,  type:"Service", color:"#E67700" },
    { id:"v2", name:"Tyre Rotation",  date:"2026-03-15", ends:"2026-09-15", cost:30,  type:"Service", color:"#E67700" },
    { id:"v3", name:"Fuel — June 1",  date:"2026-06-01", ends:"2026-06-15", cost:72,  type:"Fuel",    color:"#FF6B35" },
    { id:"v4", name:"Fuel — June 10", date:"2026-06-10", ends:"2026-06-24", cost:68,  type:"Fuel",    color:"#FF6B35" },
    { id:"v5", name:"Insurance",      date:"2026-05-01", ends:"2027-05-01", cost:420, type:"Annual",  color:"#E03131" },
    { id:"v6", name:"Windscreen Fix", date:"2026-04-22", ends:"2026-04-25", cost:180, type:"Repair",  color:"#E67700" },
  ],
  finances: [
    { id:"f1", name:"Rent",          amount:850, date:"2026-06-01", ends:"2026-07-01", type:"Fixed",    color:"#7950F2" },
    { id:"f2", name:"Groceries",     amount:210, date:"2026-06-07", ends:"2026-06-21", type:"Variable", color:"#7950F2" },
    { id:"f3", name:"Utilities",     amount:95,  date:"2026-06-05", ends:"2026-07-05", type:"Fixed",    color:"#7950F2" },
    { id:"f4", name:"Subscriptions", amount:38,  date:"2026-06-01", ends:"2026-07-01", type:"Fixed",    color:"#7950F2" },
    { id:"f5", name:"Car Wash",      amount:15,  date:"2026-06-12", ends:"2026-06-26", type:"Variable", color:"#7950F2" },
  ],
};

export const SPACES = [
  { id:"dashboard",    label:"Dashboard",    icon:"▦",  color:"#3B5BDB" },
  { id:"consumables",  label:"Consumables",  icon:"◎",  color:"#3B5BDB" },
  { id:"durables",     label:"Durables",     icon:"◈",  color:"#2F9E44" },
  { id:"car",          label:"Car",          icon:"◐",  color:"#E67700" },
  { id:"finances",     label:"Finances",     icon:"◆",  color:"#7950F2" },
];
