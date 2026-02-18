// ================= HELPERS =================
function cleanTIN(tin){
    if(!tin) return "000000000";
    return tin.replace(/[^0-9]/g,"").substring(0,9).padStart(9,'0');
}

function formatDate(dateStr){
    if(!dateStr) return "";
    let d = new Date(dateStr);
    if(isNaN(d)) return "";
    let m = String(d.getMonth()+1).padStart(2,'0');
    let day = String(d.getDate()).padStart(2,'0');
    let y = d.getFullYear();
    return `${m}/${day}/${y}`;
}

// ================= RELIEF LINE =================
function reliefLine(r){

    let buyerTIN = cleanTIN(r.business.tin);
    let branch = "000";
    let supplierTIN = cleanTIN(r.invoice.client_tin);

    let name = (r.invoice.sold_to || "").replace(/[^\w\s]/gi,"");
    let addr1 = (r.invoice.client_address || "").replace(/[^\w\s]/gi,"");

    let total = Number(r.vat.total_sales || 0).toFixed(2);
    let net = Number(r.vat.net_vat || 0).toFixed(2);
    let vat = Number(r.vat.less_vat || 0).toFixed(2);

    let date = formatDate(r.invoice.date);

    return [
        buyerTIN, "000",
        supplierTIN,
        name,
        "", "", "",
        addr1, "",
        total,
        "0.00",
        "0.00",
        total,
        net,
        "0.00",
        "0.00",
        net,
        "12",
        vat,
        date
    ].join("|");
}

// ================= SAVE DATA =================
function saveData(){

    let invoiceNo = document.getElementById("invoiceNo").value.trim();
    let soldTo = document.getElementById("soldTo").value.trim();

    if(invoiceNo=="" || soldTo==""){
        alert("Fill Invoice Number and Supplier Name");
        return;
    }

    let record = {
        business:{
            name: document.getElementById("businessName").value,
            tin: document.getElementById("businessTIN").value
        },
        invoice:{
            invoice_no: invoiceNo,
            date: document.getElementById("invoiceDate").value,
            sold_to: soldTo,
            client_tin: document.getElementById("clientTIN").value,
            client_address:
                document.getElementById("address1").value + " " +
                document.getElementById("address2").value
        },
        vat:{
            total_sales: Number(document.getElementById("totalSales").value),
            less_vat: Number(document.getElementById("lessVAT").value),
            net_vat: Number(document.getElementById("netVAT").value)
        }
    };

    let records = JSON.parse(localStorage.getItem("records")) || [];
    records.push(record);
    localStorage.setItem("records", JSON.stringify(records));

    alert("Record Saved!");
    window.location.href="records.html";
}

// ================= LOAD =================
function loadRecords(){
    let container=document.getElementById("recordsContainer");
    if(!container) return;

    let records=JSON.parse(localStorage.getItem("records"))||[];

    if(records.length===0){
        container.innerHTML="<h3>No saved records</h3>";
        return;
    }

    container.innerHTML='<button class="export-btn" onclick="exportAll()">Export ALL RELIEF</button>';

    records.forEach((r,i)=>{
        let card=document.createElement("div");
        card.className="record-card";
        card.innerHTML=`
            <button onclick="deleteRecord(${i})">Delete</button>
            <button onclick="exportSingle(${i})">Export</button>
            <div>Invoice #${r.invoice.invoice_no}</div>
            <div>${r.invoice.sold_to}</div>
        `;
        container.appendChild(card);
    });
}

function deleteRecord(i){
    let r=JSON.parse(localStorage.getItem("records"))||[];
    r.splice(i,1);
    localStorage.setItem("records",JSON.stringify(r));
    loadRecords();
}

// ================= EXPORT =================
function exportSingle(i){
    let r=JSON.parse(localStorage.getItem("records"))||[];
    let line=reliefLine(r[i]);
    download(line,cleanTIN(r[i].business.tin));
}

function exportAll(){
    let r=JSON.parse(localStorage.getItem("records"))||[];
    let lines=r.map(x=>reliefLine(x)).join("\n");
    download(lines,cleanTIN(r[0].business.tin));
}

function download(text,tin){
    let blob=new Blob([text],{type:"text/plain"});
    let a=document.createElement("a");
    a.href=URL.createObjectURL(blob);

    let now=new Date();
    let m=String(now.getMonth()+1).padStart(2,'0');
    let y=now.getFullYear();

    a.download=`${tin}P${m}${y}.RLF`;
    a.click();

    alert("Exported! Open in Notepad → Save as ANSI before loading to RELIEF.");
}

function goBack(){
    window.location.href="index.html";
}
