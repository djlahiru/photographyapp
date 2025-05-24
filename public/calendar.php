<?php
require_once 'layout_header.php'; // Includes DB connection, settings, and FullCalendar CSS/JS from header
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Booking Calendar</h1>
        <div>
            <!-- Future: Add filter controls or view toggles here if needed -->
        </div>
    </div>

    <div class="card shadow-sm">
        <div class="card-body">
            <div id='calendar'></div>
        </div>
    </div>
</div>

<style>
    /* Optional: Custom styles for FullCalendar if needed, or to ensure it respects theme */
    /* FullCalendar's own CSS is quite comprehensive */
    #calendar {
        max-width: 1100px; /* Adjust as needed */
        margin: 0 auto;
    }

    /* Ensure FullCalendar buttons match Bootstrap button styling somewhat */
    .fc .fc-button-primary {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-on-primary, #fff);
    }
    .fc .fc-button-primary:hover {
        background-color: var(--link-hover-color); /* Using link-hover-color from base_theme */
        border-color: var(--link-hover-color);
    }
    .fc .fc-button-primary:disabled {
        background-color: var(--secondary-color);
        border-color: var(--secondary-color);
    }
    .fc .fc-button-primary:not(:disabled):active, 
    .fc .fc-button-primary:not(:disabled).fc-button-active {
        background-color: var(--link-hover-color);
        border-color: var(--link-hover-color);
    }

    /* Event background color will be set by the JSON feed */
    .fc-event {
        border-width: 1px; /* Ensure border is visible */
        color: #fff; /* Default text color for events, assuming dark enough background */
    }
    .fc-event .fc-event-title {
        font-weight: 500;
    }

    /* Dark mode specific adjustments for FullCalendar if base_theme is not enough */
    body.dark-mode .fc .fc-toolbar-title {
        color: var(--heading-color);
    }
    body.dark-mode .fc th { /* Day headers, e.g., Mon, Tue */
        color: var(--text-muted-color); 
    }
    body.dark-mode .fc .fc-daygrid-day-number { /* Date numbers */
        color: var(--text-color);
    }
    body.dark-mode .fc .fc-daygrid-day.fc-day-today { /* Today's date background */
        background-color: rgba(var(--primary-color-rgb, 77, 171, 247), 0.2); /* Use a subtle highlight */
    }
     body.dark-mode .fc-list-event-dot { /* List view event dots */
        border-color: var(--primary-color);
    }
    body.dark-mode .fc-list-day th { /* Day headers in list view */
        background-color: var(--table-header-bg);
    }
    body.dark-mode .fc-list-table tbody tr:hover td { /* Row hover in list view */
        background-color: var(--table-stripe-bg);
    }


</style>

<?php
// JavaScript for FullCalendar initialization will be in layout_footer.php or here.
// For this task, putting it here for page-specificity.
// If it were common, layout_footer.php would be better.
?>
<script>
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    if (calendarEl) { // Ensure the element exists
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth', // Default view
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' // View options
            },
            events: 'api/bookings_feed.php', // URL to the JSON feed
            editable: false, // Drag-and-drop disabled
            selectable: false, // Date range selection disabled
            navLinks: true, // allows users to click on day/week names to navigate views
            dayMaxEvents: true, // allow "more" link when too many events
            // eventClick is not needed if event objects have a 'url' property.
            // FullCalendar will automatically navigate to the URL.
            // eventClick: function(info) {
            //     // Example: if you wanted to do something else, like open a modal
            //     // info.jsEvent.preventDefault(); // prevent browser navigation
            //     // if (info.event.url) {
            //     // window.open(info.event.url); // Example: open in new tab
            //     // }
            // },
            eventTimeFormat: { // Example of formatting time within events
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short' // e.g., 6:30pm
            },
            // Optional: Apply Bootstrap theming to FullCalendar components
            // themeSystem: 'bootstrap5', // This requires Bootstrap JS and Popper.js to be loaded
                                        // and might require FullCalendar's bootstrap5 plugin if available/needed.
                                        // For now, custom CSS variables are used.
            
            // Handle cases where feed might fail or return no events
            loading: function(isLoading) {
                if (isLoading) {
                    // Optionally add a loading indicator
                    // console.log('Calendar events loading...');
                } else {
                    // Optionally remove loading indicator
                    // console.log('Calendar events loaded.');
                }
            },
            // Custom rendering example (not strictly needed if title is well-formatted in feed)
            // eventContent: function(arg) {
            //     let italicEl = document.createElement('i');
            //     italicEl.innerHTML = arg.event.title;
            //     let arrayOfDomNodes = [italicEl];
            //     return { domNodes: arrayOfDomNodes }
            // }
        });
        calendar.render();
    } else {
        console.error("Calendar element #calendar not found in the DOM.");
    }
});
</script>

<?php
require_once 'layout_footer.php';
?>
