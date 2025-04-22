import { OutreachTimeEnricher } from "@/components/OutreachTimeEnricher";

// ... existing code ...

// In the component that renders lead details
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Existing lead detail sections */}
  
  {/* Add the OutreachTimeEnricher component */}
  <OutreachTimeEnricher
    leadId={lead.id}
    companyName={lead.company}
    initialLocation={lead.location || ""}
    initialTimezone={lead.timezone || ""}
    initialOutreachTime={lead.optimalOutreachTime || ""}
    onUpdate={(data) => {
      // Handle the update if needed
      console.log("Lead location data updated:", data);
    }}
  />
</div> 