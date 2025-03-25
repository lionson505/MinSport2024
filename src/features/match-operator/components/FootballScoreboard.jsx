function renderEvents(events) {
  return events.filter(event => {
    // Ensure event and event.team are defined before accessing event.team.id
    return event && event.team && event.team.id;
  }).map(event => {
    // Your existing logic to render events
  });
}

// Example of how you might use renderEvents in FootballScoreboard
function FootballScoreboard({ events }) {
  // Ensure events is an array
  if (!Array.isArray(events)) {
    console.error("Events is not an array");
    return null;
  }

  const filteredEvents = renderEvents(events);

  return (
    <div>
      {filteredEvents.map(event => (
        <div key={event.id}>
          {/* Render event details */}
        </div>
      ))}
    </div>
  );
} 