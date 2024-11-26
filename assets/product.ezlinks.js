$(function () {
  /**
   * Build priority map (maps applicable variants to priority levels)
   */
  var priorityMap = {}; // Initialize an empty object to store the priority map.
  var range = [2400, 0]; // Initialize an array to track the time range.

  // Iterate through the ezlinksVariants array.
  for (var i = 0; i < ezlinksVariants.length; i++) {
    var variantId = ezlinksVariants[i].id; // Get the variant ID from the current variant.

    // Check if the variantId is present in ezlinksMetafields.
    if (variantId in ezlinksMetafields) {
      var priority = ezlinksMetafields[variantId]["priority"]; // Get the priority level for the variant.

      // Check if the priority is valid and not empty.
      if (priority === undefined || priority === "" || isNaN(priority)) {
        console.log("[Main JS] Invalid priority", priority);
        continue; // Skip this iteration if priority is invalid.
      }

      // Check if the priority level already exists in priorityMap; if not, create it.
      if (!(priority in priorityMap)) {
        priorityMap[priority] = [];
      }

      // Push variant details into the priorityMap under the corresponding priority level.
      priorityMap[priority].push({
        variantId: variantId,
        price: ezlinksVariants[i].price,
        compareAt: ezlinksVariants[i].compare_at_price,
        dateRange: ezlinksMetafields[variantId]["date_range"],
        timeRange: ezlinksMetafields[variantId]["time_range"],
        dayOfWeek: ezlinksMetafields[variantId]["day_of_week"],
        notes: ezlinksMetafields[variantId]["notes"],
        priority: priority,
      });

      // Extract and update the time range based on the variant's time range.
      var times = ezlinksMetafields[variantId]["time_range"]
        .replace(/\s+/, "")
        .split(",");
      for (var j = 0; j < times.length; j++) {
        range[0] = Math.min(range[0], times[j].split("-")[0]);
        range[1] = Math.max(range[1], times[j].split("-")[1]);
      }
    }
  }

  // Initialize various variables used in the code.
  var latestFormsValues = {};
  var section = $("section.available-tee-times");
  var form = $("#avail-tee-times");
  var list = $("ul#available-teetimes");
  var addToCartModal = $("#modal-teetime");
  var courseId = 0;
  var addOns = [];
  var value = "";

  // Extract course ID and add-ons information from ezlinksTags.
  for (i = 0; i < ezlinksTags.length; i++) {
    value = ezlinksTags[i].split(":").slice(-1).pop();

    // Check for course ID or add-on tags and store the values accordingly.
    if (ezlinksTags[i].toLowerCase().indexOf("gnid:") !== -1) {
      courseId = value; // Store the course ID.
    } else if (ezlinksTags[i].toLowerCase().indexOf("addon:") !== -1) {
      addOns[i] = value; // Store add-ons information.
    }
  }

  /**
   * Close the modal when clicking on the modal mask or close button.
   *
   * This function is triggered when a click event occurs on elements with the classes "modal-mask" or "close." It checks
   * if the clicked element is either the modal mask or the close button, and if so, it calls the 'closeModal' function
   * to close the modal.
   *
   * @param {Event} e - The click event.
   *
   * @example
   * // Example usage:
   * // Assume you have a modal dialog with a mask and a close button to allow users to dismiss the modal.
   * var modalMask = $(".modal-mask"); // The modal mask element.
   * var closeButton = $(".close"); // The close button element.
   *
   * // Attach the 'closeModalOnClick' function to the click event of the modal mask and close button.
   * modalMask.on("click", function (e) {
   *   closeModalOnClick(e);
   * });
   * closeButton.on("click", function (e) {
   *   closeModalOnClick(e);
   * });
   *
   * // In your HTML, when the modal mask or close button is clicked, this function will be executed.
   * // It checks if the clicked element is the modal mask or close button and closes the modal accordingly.
   *
   */
  $(".modal-mask, .close").on("click", function (e) {
    var target = $(e.target);
    if (target.is(".modal-mask") || target.is(".close")) {
      closeModal();
    }
  });

  /**
   * Open a modal dialog when clicking on a "load-modal" link.
   *
   * This function is triggered when a click event occurs on an <a> element with the class "load-modal" within the "list"
   * element. It extracts the data attributes from the clicked link and opens a modal dialog using the 'openModal'
   * function with the provided data.
   *
   * @param {Event} event - The click event.
   *
   * @example
   * // Example usage:
   * // Assume you have a list of items with "load-modal" links to display additional information in a modal dialog.
   * var list = $("#list"); // The list element.
   *
   * // Attach the 'openModalOnClick' function to the click event of "load-modal" links within the list.
   * list.on("click", "a.load-modal", function (event) {
   *   openModalOnClick(event);
   * });
   *
   * // In your HTML, when a "load-modal" link within the list is clicked, this function will be executed.
   * // It extracts the necessary data from the clicked link and opens a modal dialog to display additional information.
   *
   * // This function is commonly used to provide an interactive way to view details or content within a modal dialog.
   */
  list.on("click", "a.load-modal", function (event) {
    openModal($(event.currentTarget));
  });

  /**
   * Handle the "Load More Items" button click event to display additional list items.
   *
   * This function is triggered when the "Load More Items" button is clicked. It incrementally displays more list items
   * up to a certain limit ('x'). If all list items have been displayed, the button is hidden.
   */
  var size_li = list.find("li").size(); // Total number of list items.
  var x = 6; // Number of items to display initially and incrementally.

  // Display the first set of list items (initial display).
  list.find("li:lt(" + x + ")").css("display", "inline-block");

  $("button[data-class=load-more]").on("click", function () {
    x = x + 6 <= size_li ? x + 6 : size_li;
    list.find("li:lt(" + x + ")").css("display", "inline-block");
    if (x == size_li) {
      $("button[data-class=load-more]").hide();
    }
  });

  /**
   * Remove the 'error' class when an input field within addToCartModal is focused.
   *
   * This function is triggered when an input field within the addToCartModal gains focus. It removes the 'error' class
   * from the input field, providing visual feedback to the user that the input field is active and ready for input.
   *
   * @param {Event} event - The focus event on an input field.
   *
   * @example
   * // Example usage:
   * // Assume you have input fields within the addToCartModal that may have the 'error' class for validation errors.
   * var addToCartModal = $("#addToCartModal"); // The modal element.
   *
   * addToCartModal.on("focus", "form input", function (event) {
   *   removeErrorClass(event);
   * });
   *
   * // In your HTML, when an input field within the modal gains focus, this function will be executed.
   * // It removes the 'error' class from the input field, indicating that the field is ready for user input.
   *
   */
  addToCartModal.on("focus", "form input", function (event) {
    $(event.currentTarget).removeClass("error");
  });

  /**
   * Handle the form submission within the addToCartModal.
   *
   * This function is triggered when a form within the addToCartModal is submitted. It performs several actions, including
   * form validation, error handling, and redirection to the cart page with the selected parameters if the form is valid.
   *
   * @param {Event} event - The form submission event.
   *
   * @example
   * // Example usage:
   * // Assume you have a form within the addToCartModal that collects user information.
   * var addToCartModal = $("#addToCartModal"); // The modal element.
   *
   * addToCartModal.on("submit", "form", function (event) {
   *   handleFormSubmission(event);
   * });
   *
   * // In your HTML, when the form within the modal is submitted, this function will be executed.
   * // It performs form validation, checks for required fields, and redirects to the cart page if the form is valid.
   *
   */
  addToCartModal.on("submit", "form", function (event) {
    var atcForm = $(event.currentTarget);
    atcForm.find("input[name=full_name]").removeClass("error"); 
    atcForm.find("label[class=required-full_name]").remove();
    event.preventDefault();
    var formData = {};
    $.each(atcForm.serializeArray(), function (_, field) {
      formData[field.name] = field.value;
    });
    if (
      formData.full_name.length == 0 &&
      atcForm.find("label[class=required-full_name]").length === 0
    ) {
      atcForm
        .find("input[name=full_name]")
        .addClass("error")
        .after('<label class="required-full_name">Full Name Required</label>');
    }

    if (formData.full_name.length == 0) {
      return;
    } else {
      var nameArray = formData.full_name.split(' ');
      var firstName = nameArray[0];
      var lastName = nameArray.slice(1).join(' ');
    }

    var parameters = {
      id: formData.variant,
      quantity: formData.numberOfPlayersAllow,
      properties: {
        "First Name": firstName,
        "Last Name": lastName,
        Hotel: formData.hotel,
        Date: formData.date,
        Time: formData.time,
        _rate_id: formData.rate_id,
        _courseid: courseId,
        _addons: addOns,
      },
    };
    console.log("[handleFormSubmission] Form data", JSON.stringify(parameters));
    if (parameters.properties._rate_id) {
      window.location.href = "/cart/add?" + $.param(parameters);
    } else {
      window.location.reload()
    }
  });

  /**
   * Transforms a payload of tee times into a new format, excluding tee times with missing TeeTimeRateID.
   *
   * @param {object} payload - The input payload containing tee times.
   * @param {Array<object>} payload.TeeTimes - An array of tee time objects to be transformed.
   * @returns {object} - The transformed payload with tee times in the new format (excluding those without TeeTimeRateID).
   * @returns {object} Transformed payload schema:
   *   {
   *     times: Array<{
   *       rate_id: number,
   *       raw: string,
   *       formatted: string,
   *       date: string,
   *       datetime: string,
   *       players_allow: {
   *         display: string,
   *         min_raw: number,
   *         max_raw: number,
   *       },
   *     }>
   *   }
   *
   * @example
   * // Sample input payload
   * const inputPayload = {
   *   TeeTimes: [
   *     {
   *       PlayerRule: 1,
   *       Time: "2023-09-05T14:30:00Z",
   *       DisplayRate: {
   *         TeeTimeRateID: 12345
   *       }
   *     },
   *     {
   *       PlayerRule: 4,
   *       Time: "2023-09-05T10:15:00Z",
   *       DisplayRate: {
   *         TeeTimeRateID: 67890
   *       }
   *     },
   *     // ... more tee time objects
   *   ]
   * };
   *
   * // Transform the payload, excluding tee times without TeeTimeRateID
   * const transformedPayload = transformPayload(inputPayload);
   *
   * // The transformedPayload will contain tee times in the new format.
   */
  function transformPayload(payload) {
    var teeTimes = payload.TeeTimes;
    var transformedPayload = {
      times: [],
    };

    teeTimes.forEach(function (teeTime) {
      var playerRule = teeTime.PlayerRule;
      if (playerRule === 0) {
        console.log(`Excluding tee time with PlayerRule 0`, teeTime);
        // Exclude tee time with PlayerRule 0
        return;
      }

      var time = teeTime.Time;
      var date = new Date(time);
      var hour = date.getHours();
      var minute = date.getMinutes();
      var datetime = date.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      var formattedTime =
        (date.getHours() % 12 || 12).toString() +
        ":" +
        date.getMinutes().toString().padStart(2, "0") +
        " " +
        (date.getHours() < 12 ? "AM" : "PM");

      var rawTime =
        hour.toString().padStart(2, "0") + minute.toString().padStart(2, "0");

      var playerAllowDisplay = "";
      var playerAllowMinRaw = 0;
      var playerAllowMaxRaw = 0;

      if (playerRule === 1) {
        playerAllowDisplay = "1 Player";
        playerAllowMinRaw = 1;
        playerAllowMaxRaw = 1;
      } else if (playerRule === 2) {
        playerAllowDisplay = "2 Players";
        playerAllowMinRaw = 2;
        playerAllowMaxRaw = 2;
      } else if (playerRule === 3) {
        playerAllowDisplay = "1 - 2 Players";
        playerAllowMinRaw = 1;
        playerAllowMaxRaw = 2;
      } else if (playerRule === 4) {
        playerAllowDisplay = "3 Players";
        playerAllowMinRaw = 3;
        playerAllowMaxRaw = 3;
      } else if (playerRule === 6) {
        playerAllowDisplay = "2 - 3 Players";
        playerAllowMinRaw = 2;
        playerAllowMaxRaw = 3;
      } else if (playerRule === 7) {
        playerAllowDisplay = "1 - 3 Players";
        playerAllowMinRaw = 1;
        playerAllowMaxRaw = 3;
      } else if (playerRule === 8) {
        playerAllowDisplay = "4 Players";
        playerAllowMinRaw = 4;
        playerAllowMaxRaw = 4;
      } else if (playerRule === 10) {
        playerAllowDisplay = "2 - 4 Players";
        playerAllowMinRaw = 2;
        playerAllowMaxRaw = 4;
      } else if (playerRule === 12) {
        playerAllowDisplay = "3 - 4 Players";
        playerAllowMinRaw = 3;
        playerAllowMaxRaw = 4;
      } else if (playerRule === 14) {
        playerAllowDisplay = "2 - 4 Players";
        playerAllowMinRaw = 2;
        playerAllowMaxRaw = 4;
      } else if (playerRule === 15 || playerRule > 15) {
        playerAllowDisplay = "1 - 4 Players";
        playerAllowMinRaw = 1;
        playerAllowMaxRaw = 4;
      } else {
        console.log("[transformPayload] Unknown player rule", playerRule);
      }

      var transformedTeeTime = {
        rate_id: teeTime.DisplayRate.TeeTimeRateID,
        raw: rawTime.replace(/^0/, ""),
        formatted: formattedTime,
        date: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        datetime: datetime.replace(",", "") + " at " + formattedTime,
        "players-allow": {
          display: playerAllowDisplay,
          min_raw: playerAllowMinRaw,
          max_raw: playerAllowMaxRaw,
        },
      };

      // We only want to include
      if (
        // In the case we do not have any unknown player rule
        transformedTeeTime["players-allow"].display !== "" &&
        transformedTeeTime.rate_id !== null &&
        transformedTeeTime.rate_id !== undefined &&
        transformedTeeTime.rate_id !== ""
      ) {
        transformedPayload.times.push(transformedTeeTime);
      } else {
        // In the case there is not rate_id let's not add it.
        console.error(
          "[transformPayload] Error - Missing Rate ID or Unknown Player Rule",
          transformedTeeTime,
          { playerRule }
        );
      }
    });

    if (transformedPayload.times.length === 0) {
      console.error("[transformPayload] Error - Transformed payload is empty.");
    } else {
      console.log("[transformPayload] Transformed payload", transformedPayload);
    }

    return transformedPayload;
  }

  /**
   * Load available tee times based on the provided type.
   *
   * @param {string} type - The type of tee times to load.
   *
   * @example
   * // Load tee times when the date changes
   * loadTimes("dateChange");
   */
  function loadTimes(type) {
    var formData = buildFormData();
    console.log(`[loadTimes] Type ${type} formData`, formData);
    $.ajax({
      type: "GET",
      url: availabilityUrl(),
      success: function (response) {},
      complete: function (response) {
        if (latestFormsValues.date === formData.date) {
          hideResults();
        }
      },
      error: function (request, status, error) {
        errorLog(error, "Error");
      },
    }).done(function (data) {
      data = transformPayload(data);
      buildTimesOptions("tee-times", "htt-times", data, type);
      section.addClass("loading");
      $("#response-none").hide();
      list.empty();
      generateResults(data, formData);
    });
  }

  /**
   * Builds FormData object from the form data.
   *
   * @returns {Object} The FormData object containing form fields and values.
   *
   * @example
   * // Assuming you have an HTML form with fields like this:
   * // <form id="myForm">
   * //   <input type="text" name="firstName" value="John">
   * //   <input type="text" name="lastName" value="Doe">
   * // </form>
   *
   * // You can call buildFormData like this:
   * var formData = buildFormData();
   *
   * // The formData object will contain the form fields and values:
   * // {
   * //   firstName: "John",
   * //   lastName: "Doe"
   * // }
   */
  function buildFormData() {
    var formData = {};

    // Serialize the form data into an array and convert it to an object.
    $.each(form.serializeArray(), function (_, field) {
      formData[field.name] = field.value;
    });

    // Add loading class, hide response-none, and empty the list.
    section.addClass("loading");
    $("#response-none").hide();
    list.empty();

    // Store the latest form values.
    latestFormsValues = formData;

    return formData;
  }

  /**
   * Convert date format from YYYY-MM-DD or DD-MM-YYYY to DD/MM/YYYY.
   *
   * @param {string} dateString - The input date string in the format "YYYY-MM-DD" or "DD-MM-YYYY".
   * @returns {string} The converted date string in the format "DD/MM/YYYY".
   *
   * @example
   * // Usage examples:
   * var inputDate1 = "2023-09-06";
   * var convertedDate1 = convertDateFormat(inputDate1);
   * // The convertedDate1 variable will contain "06/09/2023".
   *
   * var inputDate2 = "06-09-2023";
   * var convertedDate2 = convertDateFormat(inputDate2);
   * // The convertedDate2 variable will also contain "06/09/2023".
   */
  function convertDateFormat(dateString) {
    // Check if the input string matches the "YYYY-MM-DD" format
    var yyyyMMddPattern = /^\d{4}-\d{2}-\d{2}$/;

    // Check if the input string matches the "DD-MM-YYYY" format
    var ddMMyyyyPattern = /^\d{2}-\d{2}-\d{4}$/;

    if (yyyyMMddPattern.test(dateString)) {
      // Input is in "YYYY-MM-DD" format, split and convert
      var dateParts = dateString.split("-");
      return dateParts[2] + "/" + dateParts[1] + "/" + dateParts[0];
    } else if (ddMMyyyyPattern.test(dateString)) {
      // Input is in "DD-MM-YYYY" format, split and convert
      var dateParts = dateString.split("-");
      return dateParts[0] + "/" + dateParts[1] + "/" + dateParts[2];
    } else {
      // Invalid date format, return as is
      return dateString;
    }
  }

  /**
   * Generates an availability URL based on form data and course information.
   *
   * @returns {string} The availability URL for querying tee time availability.
   *
   * @example
   * // Usage example:
   * var url = availabilityUrl();
   * // The 'url' variable will contain the availability URL.
   */
  function availabilityUrl() {
    // Base URL for the availability API
    var url = `https://webhooks.getmesa.com/v1/aloha-golf/webrequest/64f0c75ac6d79b501c6da885/64f0c75ac6d79b501c6da886.json`;

    // Query parameters for the API request
    var query = {
      apikey: "48B9ORDIC19gh0obMk9lU8WOs6z8iFJ18tMffIkY", // Replace with your API key
      date: convertDateFormat(buildFormData().date.replace(/\//g, "-")), // Convert and format the date
      courseid: courseId, // The course ID
      players: getUserPlayers(), // The number of players
    };

    // Construct and return the final URL with query parameters
    return `${url}?${$.param(query)}`;
  }

  /**
   * Gets all the blackout dates for variants with a specific price.
   *
   * This function iterates through an array of `ezlinksVariants` and checks if the price of each variant
   * is equal to 999900. If so, it retrieves blackout date ranges for that variant from `ezlinksMetafields`
   * and compiles all the dates within those ranges into an array.
   *
   * @returns {Date[]} An array containing all the blackout dates as Date objects.
   *
   * @example
   * // Sample usage:
   * var blackoutDates = getBlackoutDate();
   * console.log(blackoutDates);
   * // Output: [Date, Date, ...] (an array of Date objects representing blackout dates)
   */
  var getBlackoutDate = function () {
    var result = [];
    for (var i = 0; i < ezlinksVariants.length; i++) {
      var variantId = ezlinksVariants[i].id;
      var variantPrice = ezlinksVariants[i].price;
      if (variantPrice === 999900) {
        // Array of all blackout date ranges
        arrayDates = ezlinksMetafields[variantId].date_range.split(",");
        // Create an array containing all dates within all date ranges
        for (var dateArray = 0; dateArray < arrayDates.length; dateArray++) {
          arrayDate = arrayDates[dateArray].split("-");
          startDate = arrayDate[0];
          endDate = arrayDate[1];
          var d = getDates(new Date(startDate), new Date(endDate));
          result = result.concat(d); // Merges both arrays
        }
      }
    }

    return result;
  };

  /**
   * Gets an array of date strings within a specified date range.
   *
   * @param {number} d1 - The start date as a timestamp in milliseconds.
   * @param {number} d2 - The end date as a timestamp in milliseconds.
   * @return {string[]} An array of date strings in the format 'MM-DD-YYYY'.
   *
   * @example
   * // Get dates between January 1, 2023, and January 5, 2023.
   * var startDate = new Date('2023-01-01').getTime(); // Timestamp for January 1, 2023
   * var endDate = new Date('2023-01-05').getTime();   // Timestamp for January 5, 2023
   * var dateArray = getDates(startDate, endDate);
   *
   * // The 'dateArray' will contain:
   * // ["1-1-2023", "1-2-2023", "1-3-2023", "1-4-2023", "1-5-2023"]
   */
  var getDates = function (d1, d2) {
    var oneDay = 24 * 3600 * 1000;
    var d = [];
    for (ms = d1 * 1, last = d2 * 1; ms < last; ms += oneDay) {
      myDate = new Date(ms);
      d.push(
        myDate.getMonth() +
          1 +
          "-" +
          myDate.getDate() +
          "-" +
          myDate.getFullYear()
      );
    }
    d.push(d2.getMonth() + 1 + "-" + d2.getDate() + "-" + d2.getFullYear());

    return d;
  };

  /**
   * Disables specified dates in a date picker.
   *
   * @param {Date} date - The date to check for blackout status.
   * @return {boolean[]} An array containing a boolean indicating whether the date is disabled.
   *
   * @example
   * // Assume 'getBlackoutDate' returns an array of blackout dates in the format 'MM-DD-YYYY'.
   * var currentDate = new Date('2023-01-01'); // Date to check for blackout status
   * var isDisabled = disableBlackOutDates(currentDate);
   *
   * // 'isDisabled' will be an array with a single boolean value indicating whether the date is disabled.
   * // If 'currentDate' is a blackout date, 'isDisabled' will be [false].
   * // Otherwise, 'isDisabled' will be [true].
   */
  var disableBlackOutDates = function (date) {
    var m = date.getMonth();
    var d = date.getDate();
    var y = date.getFullYear();
    var datesRange = getBlackoutDate(); // Assumes 'getBlackoutDate' retrieves blackout dates.
    var currentDate = m + 1 + "-" + d + "-" + y;

    for (var i = 0; i < datesRange.length; i++) {
      if ($.inArray(currentDate, datesRange) !== -1) {
        // console.log("[disableBlackOutDates] Blackout date found", currentDate);
        return [false];
      } else {
        return [true];
      }
    }

    return [true];
  };

  /**
   * Gets the minimum date value depending on the time of day.
   *
   * @returns {number} The minimum date value, where 0 represents today and 1 represents tomorrow.
   *
   * @example
   * // Get the minimum date value based on the current time of day.
   * var minDate = getMinDate();
   *
   * // 'minDate' will be either 0 (if it's before 5 PM HST) or 1 (if it's 5 PM HST or later).
   * // 0 represents today, and 1 represents tomorrow.
   */
  var getMinDate = function () {
    var offset = -10; // Hawaii Standard Time (HST) offset in hours
    var currentTime = new Date(new Date().getTime() + offset * 3600 * 1000)
      .toUTCString()
      .replace(/ GMT$/, "");

    // Extract the current hour from the formatted time string
    var currentHour = parseInt(currentTime.split(" ")[4].split(":")[0]);

    // Set the minimum date to tomorrow (1) if it's past 5 PM in HST, or today (0) otherwise
    if (currentHour >= 17) {
      return 1;
    } else {
      return 0;
    }
  };

  /**
   * Configure the datePicker jQuery plugin with specific settings.
   *
   * This function configures the behavior of a datePicker jQuery plugin
   * by setting the minimum date, disabling blackout dates, and initializing
   * the date picker with the current date selected.
   *
   * @example
   * // Configure the datePicker plugin with the specified settings.
   * datePickerConfig();
   *
   * // This function assumes that you have an HTML element with the class "datepicker"
   * // inside an element with the ID "avail-tee-times," and it configures the date picker
   * // to:
   * // 1. Set the minimum date based on the current time of day using 'getMinDate'.
   * // 2. Disable blackout dates using 'disableBlackOutDates' function.
   * // 3. Initialize the date picker with the current date selected.
   */
  var datePickerConfig = function () {
    $("#avail-tee-times .datepicker")
      .datepicker({
        minDate: getMinDate(), // Set the minimum date using 'getMinDate'
        beforeShowDay: disableBlackOutDates, // Disable blackout dates using 'disableBlackOutDates'
      })
      .datepicker("setDate", "0"); // Initialize with the current date selected
  };

  /**
   * Get the selected value of tee-times from an input element.
   *
   * This function retrieves the numeric value selected in an input element with the ID "tee-times"
   * and logs it to the console for debugging purposes.
   *
   * @returns {number} The selected value of tee-times as a number.
   *
   * @example
   * // Get the selected tee-times value from an input element.
   * var teeTimeValue = getUserTeeTime();
   *
   * // This function assumes there is an HTML input element with the ID "tee-times" that represents
   * // the tee-time value. It retrieves this value and returns it as a number.
   *
   * // Example usage:
   * // If the input element with ID "tee-times" has a selected value of 4, 'teeTimeValue' will be 4.
   */
  var getUserTeeTime = function () {
    var currentValue = parseInt($("#tee-times").val()); // Get and parse the selected value
    console.log("[getUserTeeTime] Current value", currentValue); // Log the current value to the console
    return currentValue; // Return the parsed numeric value
  };

  /**
   * Get the selected number of tee players from an input element.
   *
   * This function retrieves the selected number of tee players from an input element with the ID "tee-players."
   * If "all" is selected, it is converted to the default value of 4, and the result is returned as a number.
   *
   * @returns {number} The selected number of tee players as a number.
   *
   * @example
   * // Get the selected tee players value from an input element.
   * var teePlayersValue = getUserPlayers();
   *
   * // This function assumes there is an HTML input element with the ID "tee-players" that represents
   * // the number of tee players. It retrieves this value and returns it as a number.
   *
   * // Example usage:
   * // If the input element with ID "tee-players" has "all" selected, 'teePlayersValue' will be 4.
   * // If it has a specific number (e.g., "2") selected, 'teePlayersValue' will be 2 as a number.
   */
  var getUserPlayers = function () {
    var players = $("#tee-players").val(); // Get the selected value
    if (players === "all") {
      players = ""; // Convert "all" to the default value of 4
    }
    console.log("[getUserPlayers] Current value", players); // Log the current value to the console
    return parseInt(players) || ""; // Return the parsed numeric value or empty
  };

  /**
   * Match a variant based on provided criteria.
   *
   * This function searches for a matching variant based on the given date, raw time, and day of the week (dow).
   * Variants are defined in a priorityMap array, where each element represents a priority level and contains an array of variants with criteria for day, time, and date ranges.
   * The function iterates through the priorityMap, evaluating each variant's criteria, and returns the first variant that matches all criteria.
   *
   * @param {Date} datetime - The date and time to be matched against the variants.
   * @param {number} raw - The raw time (e.g., minutes since midnight) to be matched against the variants.
   * @param {string} dow - The day of the week (abbreviated to three letters, e.g., "Mon") to be matched against the variants.
   * @returns {Object|null} The matching variant object or null if no variant matches the criteria.
   *
   * @example
   * // Define a priorityMap as an array of arrays, where each inner array represents a priority level
   * // and contains variants with specific criteria.
   * var priorityMap = [
   *   [
   *     {
   *       dayOfWeek: "Mon, Tue, Wed",
   *       timeRange: "600-900",
   *       dateRange: "2023-01-01-2023-01-31",
   *       variantData: { }
   *     },
   *     // Additional variants...
   *   ],
   *   [
   *     // Variants with lower priority...
   *   ],
   *   // Additional priorities...
   * ];
   *
   * // Example usage:
   * var datetime = new Date('2023-01-15T08:30:00');
   * var raw = 510; // 8 hours and 30 minutes since midnight
   * var dow = 'Sun'; // Sunday
   * var matchingVariant = matchVariant(datetime, raw, dow);
   *
   * // 'matchingVariant' will contain the first variant that matches all criteria
   * // or null if no variant matches the criteria.
   */
  var matchVariant = function (datetime, raw, dow) {
    dow = dow.substring(0, 3); // Extract the first three letters of the day of the week
    raw = parseInt(raw);

    // Get priority levels from the priorityMap and sort them in descending order
    var priority = Object.keys(priorityMap).sort(function (a, b) {
      return b - a;
    });

    // Iterate through priority levels
    for (var i = 0; i < priority.length; i++) {
      var key = priority[i];

      // Iterate through variants within the current priority level
      for (var j = 0; j < priorityMap[key].length; j++) {
        var variant = priorityMap[key][j];

        // Match day of the week
        var dayMatch = false;
        var variantDays = variant["dayOfWeek"].replace(/\s+/, "").split(",");
        for (var k = 0; k < variantDays.length; k++) {
          if (
            variantDays[k].toLowerCase() === "all" ||
            variantDays[k].toLowerCase() === dow.toLowerCase()
          ) {
            dayMatch = true;
            break;
          }
        }
        if (!dayMatch) {
          console.log('[matchVariant] Day does not match', dow, variantDays)
          continue; // Skip to the next variant if day does not match
        }

        // Match time range
        var timeMatch = false;
        var variantTimes = variant["timeRange"].replace(/\s+/, "").split(",");
        for (k = 0; k < variantTimes.length; k++) {
          var start = parseInt(variantTimes[k].split("-")[0]);
          var end = parseInt(variantTimes[k].split("-")[1]);
          if (start <= raw && end >= raw) {
            timeMatch = true;
            break;
          }
        }
        if (!timeMatch) {
          console.log('[matchVariant] Time does not match', raw, variantTimes)
          continue; // Skip to the next variant if time does not match
        }

        // Match date range
        var dateMatch = false;
        var variantDates = variant["dateRange"].replace(/\s+/, "").split(",");
        for (k = 0; k < variantDates.length; k++) {
          start = new Date(variantDates[k].split("-")[0]);
          end = new Date(variantDates[k].split("-")[1]);

          if (start <= datetime && end >= datetime) {
            dateMatch = true;
            break;
          }
        }

        if (!dateMatch) {
          continue; // Skip to the next variant if date does not match
        }

        return variant; // Return the first variant that matches all criteria
      }
    }

    return null; // Return null if no variant matches the criteria
  };

  /**
   * Generate HTML boxes based on response data and form data.
   *
   * This function generates HTML boxes based on the provided `response` data and `formData`. It calculates the number of players,
   * tee time, and iterates through the response times to filter and create HTML boxes for valid options. It matches time variants,
   * sets item data, and adds items to the result list.
   *
   * @param {Object} response - The response data containing tee times and details.
   * @param {Object} formData - The form data with user selections, including date, players, etc.
   *
   * @example
   * // Example usage:
   * // Assume you have response data and form data objects.
   * var response = {
   *   times: [
   *     {
   *       raw: "0800",
   *       datetime: "2023-09-07T08:00:00",
   *       date: "Wednesday, September 7th",
   *       formatted: "8:00 AM",
   *       // ... other properties ...
   *     },
   *     // ... other tee time objects ...
   *   ],
   * };
   *
   * var formData = {
   *   date: "2023-09-07",
   *   // ... other form data ...
   * };
   *
   * // Generate HTML boxes based on the response and form data.
   * generateResults(response, formData);
   *
   * // This function will create HTML boxes based on valid tee times from the response, matching variants,
   * // and setting item data. The generated boxes are added to the result list.
   *
   */
  var generateResults = function (response, formData) {
    var numberOfPlayers = getUserPlayers();
    var teeTime = getUserTeeTime();
    console.log("[generateResults] Tee time", teeTime);
    console.log("[generateResults] response", response.times);

    if (latestFormsValues.date !== formData.date) {
      section.addClass("loading");
      $("#response-none").hide();
      list.empty();
      return;
    }

    for (var i = 0; i < response.times.length; i++) {
      var time = parseInt(response.times[i].raw);
      if (time < teeTime) {
        console.log(
          "[generateResults] Time is less than tee time",
          time,
          teeTime,
          response.times[i]
        );
        continue;
      }
      if (range[0] > time || range[1] <= time) {
        console.log(
          "[generateResults] Time is out of range",
          time,
          range,
          response.times[i]
        );
        continue;
      }

      var datetime = new Date(
        response.times[i].datetime.replace(" at", "").split(".").join("")
      );

      var matched = matchVariant(
        datetime,
        response.times[i].raw,
        response.times[i].date.split(/\s+/)[0]
      );

      if (matched === null || matched.price == 999900) {
          console.log(
          "[generateResults] Matched null or matched.price 999900",
          time,
          range,
          response.times[i]
        );
        continue;
      }

      var itemData = {
        price: "",
        compareAt: "",
        date: response.times[i].date,
        usDate: formData.date,
        datetime: response.times[i].datetime,
        time: response.times[i].formatted,
        players: response.times[i]["players-allow"]["display"],
        players_min_raw: response.times[i]["players-allow"]["min_raw"],
        players_max_raw: response.times[i]["players-allow"]["max_raw"],
        rate_id: response.times[i]["rate_id"],
        quantity: numberOfPlayers,
        priority: matched.priority,
        notes: matched.notes,
      };

      itemData.price = (matched.price / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
      itemData.compareAt = (matched.compareAt / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
      itemData.variantId = matched.variantId;

      addItem(itemData);
    }
  };

  /**
   * Perform actions upon completion of a GET request by adding/hiding classes.
   *
   * This function is executed upon completion of a GET request and performs various actions such as displaying or hiding elements
   * based on the results. It calculates the number of items in a list and determines whether to show a "Load More" button or
   * display a message when no results are available. Additionally, it removes the "loading" class after a delay.
   *
   * @example
   * // Example usage:
   * // Assume you have a list of items with a "Load More" button and a message container.
   * var list = $("#result-list"); // The list container.
   * var x = 6; // Maximum number of items to display initially.
   * var size_li = list.find("li").size(); // Total number of items in the list.
   *
   * // Execute the 'hideResults' function to manipulate the display of items and elements.
   * hideResults();
   *
   * // The function will show the first 'x' items, display or hide the "Load More" button based on the number of items,
   * // and show a message when no results are available. It also removes the "loading" class after a delay.
   *
   */
  function hideResults() {
    size_li = list.find("li").size();
    var x = 6; // Maximum number of items to display initially.

    list.find("li:lt(" + x + ")").css("display", "inline-block");

    if (size_li > x) {
      $("button[data-class=load-more]").show();
    } else if (size_li == 0) {
      $("button[data-class=load-more]").hide();
      $("#response-none").show();
    }

    if ($("#available-teetimes a").attr("data-price") == "") {
      $("button[data-class=load-more]").hide();
      $("#response-none").show();
    }

    // Remove the "loading" class after a delay.
    setTimeout(function () {
      section.removeClass("loading");
    }, 800);
  }

  /**
   * Add a line item to the results-window list.
   *
   * This function creates and appends a new list item (<li>) with detailed information for a booking item
   * to a results window list. It takes an 'itemData' object as input, which contains various attributes for the booking item.
   *
   * @param {Object} itemData - An object containing data for the booking item.
   * @param {string} itemData.datetime - The datetime of the booking.
   * @param {number} itemData.players_min_raw - The minimum number of players (raw value).
   * @param {number} itemData.players_max_raw - The maximum number of players (raw value).
   * @param {number} itemData.quantity - The quantity of items.
   * @param {number} itemData.price - The price of the item.
   * @param {number} itemData.compareAt - The compared price of the item.
   * @param {string} itemData.variantId - The variant ID.
   * @param {string} itemData.usDate - The date in US format (e.g., "MM-DD-YYYY").
   * @param {string} itemData.time - The booking time.
   * @param {string} itemData.rate_id - The rate ID.
   * @param {string} itemData.notes - Additional notes for the booking.
   *
   * @example
   * // Example usage:
   * var itemData = {
   *   datetime: "2023-09-15 14:30:00",
   *   players_min_raw: 2,
   *   players_max_raw: 4,
   *   quantity: 1,
   *   price: 25.99,
   *   compareAt: 30.00,
   *   variantId: "12345",
   *   usDate: "09-15-2023",
   *   time: "02:30 PM",
   *   rate_id: "67890",
   *   notes: "Special request: Non-smoking area"
   * };
   *
   * // Add the 'itemData' to the results window list.
   * addItem(itemData);
   *
   * // This function constructs a list item with detailed information based on 'itemData' and appends it to the list.
   * // The list item includes pricing, booking details, and a "Book Now" call-to-action.
   */
  function addItem(itemData) {
    var item = $("<li/>");
    var anchor = $("<a/>").addClass("load-modal");
    if (itemData.priority > 0 && itemData.priority != 500) {
      anchor.addClass("special");
    }

    // Add various data attributes to the anchor element...
    anchor.attr("data-datetime", itemData.datetime);
    anchor.attr("data-players-min", itemData.players_min_raw);
    anchor.attr("data-players-max", itemData.players_max_raw);
    anchor.attr("data-quantity", itemData.quantity);
    anchor.attr("data-price", itemData.price);
    anchor.attr("data-compare", itemData.compareAt);
    anchor.attr("data-variant-id", itemData.variantId);
    anchor.attr("name", "variant-" + itemData.variantId);
    anchor.attr("data-date", itemData.usDate);
    anchor.attr("data-time", itemData.time);
    anchor.attr("data-rate_id", itemData.rate_id);
    anchor.attr("data-notes", itemData.notes);

    // Create the pricing section with compareAt price and item price...
    var pricing = $("<span/>").addClass("pricing");
    $("<span/>")
      .addClass("compare-at-price")
      .text(itemData.compareAt)
      .appendTo(pricing)
      .after(" ");
    $("<strong/>").text(itemData.price).appendTo(pricing);
    pricing.appendTo(anchor);

    // Create the booking details section with date, time, and number of players...
    var details = $("<span/>").addClass("details");
    $("<span/>").addClass("date").text(itemData.date).appendTo(details);
    $("<time/>").text(itemData.time).appendTo(details);
    $("<span/>").addClass("players").text(itemData.players).appendTo(details);
    details.appendTo(anchor);

    // Create the "Book Now" call-to-action...
    var cta = $("<span/>").addClass("cta").text("Book Now");
    cta.appendTo(anchor);

    // Append the anchor element to the list item...
    anchor.appendTo(item);

    // Append the list item to the results window list...
    item.appendTo(list);
  }

  /**
   * Build a select dropdown list for selecting the number of players.
   *
   * This function generates a `<select>` dropdown list containing options for selecting the number of players
   * based on the provided minimum and maximum player values. It also sets the selected option based on the current
   * user's selected number of players if available.
   *
   * @param {number} minPlayers - The minimum number of players to include in the dropdown list.
   * @param {number} maxPlayers - The maximum number of players to include in the dropdown list.
   * @returns {jQuery} A jQuery object representing the generated `<select>` dropdown list.
   *
   * @example
   * // Example usage:
   * var minPlayers = 1;
   * var maxPlayers = 4;
   *
   * // Build the player select dropdown list based on the provided min and max players.
   * var playerSelectList = buildPlayerSelectList(minPlayers, maxPlayers);
   *
   * // Append the generated dropdown list to a form or container in your HTML.
   * $("#player-select-container").append(playerSelectList);
   *
   * // This function creates a dropdown list with player count options between 'minPlayers' and 'maxPlayers'.
   * // It also sets the selected option based on the current user's selection if applicable.
   */
  var buildPlayerSelectList = function (minPlayers, maxPlayers) {
    var s = $("<select/>");
    s.attr("name", "numberOfPlayersAllow");
    s.attr("form", "user_info");
    maxPlayers = Number(maxPlayers);

    // Iterate through player counts from minPlayers to maxPlayers.
    for (var i = minPlayers; i <= maxPlayers; i++) {
      if (getUserPlayers() === i) {
        // Set the selected option if it matches the user's selection.
        s.append($("<option/>").attr("selected", true).html(i));
      } else if (getUserPlayers() === 0 && maxPlayers === i) {
        // Set the selected option to the maximum player count if the user's selection is not available.
        s.append($("<option/>").attr("selected", true).html(i));
      } else {
        s.append($("<option/>").html(i));
      }
    }
    return s;
  };

  /**
   * Open the "Add to Cart" modal and attach data using data attributes.
   *
   * This function opens the "Add to Cart" modal and populates it with data from the provided anchor element's data attributes.
   * The data attributes contain information about the booking item, such as datetime, price, notes, and more.
   *
   * @param {jQuery} anchor - A jQuery object representing the anchor element that triggers the modal.
   *
   * @example
   * // Example usage:
   * var anchor = $("#booking-anchor"); // Replace with the actual selector for the anchor element.
   *
   * // Open the "Add to Cart" modal and populate it with data from the anchor element's data attributes.
   * openModal(anchor);
   *
   * // This function opens the modal and displays information based on the data attributes of the provided anchor element.
   * // It attaches data like datetime, price, notes, and more to the modal for further user interaction.
   */
  function openModal(anchor) {
    // Generate a select list of players based on data attributes.
    var selectListOfPlayers = buildPlayerSelectList(
      anchor.attr("data-players-min"),
      anchor.attr("data-players-max")
    );

    // Populate the "Add to Cart" modal with data from data attributes.
    addToCartModal
      .find("p[data-class=datetime]")
      .text(anchor.attr("data-datetime"));
    addToCartModal
      .find("strong[data-class=price]")
      .text(anchor.attr("data-price"));
    addToCartModal
      .find("span[data-class=compare]")
      .text(anchor.attr("data-compare"));
    if (anchor.attr("data-notes")) {
      addToCartModal
        .find("div[data-class=notes]")
        .show()
        .text(anchor.attr("data-notes"));
    }
    addToCartModal
      .find("form input[name=variant]")
      .val(anchor.attr("data-variant-id"));
    addToCartModal
      .find("form input[name=rate_id]")
      .val(anchor.attr("data-rate_id"));
    addToCartModal
      .find("form input[name=quantity]")
      .val(anchor.attr("data-quantity"));
    addToCartModal.find("form input[name=date]").val(anchor.attr("data-date"));
    addToCartModal.find("form input[name=time]").val(anchor.attr("data-time"));
    addToCartModal
      .find("form input[name=players]")
      .val(anchor.attr("data-players"));

    // Create text for the number of players.
    var playersText =
      anchor.attr("data-quantity") == 1
        ? "1 Player"
        : anchor.attr("data-quantity") + " Players";

    // Populate the modal with the player select list.
    addToCartModal
      .find("span[data-class=players]")
      .empty()
      .append(selectListOfPlayers);

    // Show the "Add to Cart" modal and prevent body scrolling.
    addToCartModal.show();
    document.body.classList.add("noscroll");
  }

  /**
   * Close the "Add to Cart" modal and reset its content.
   *
   * This function hides the "Add to Cart" modal and resets its content, including clearing input fields and removing error classes.
   * It also clears any notes and restores scrolling functionality to the body.
   *
   * @example
   * // Example usage:
   * // Assuming you have a close button or trigger element with an ID like "close-modal-button".
   *
   * // Attach a click event handler to the close button to trigger the modal closure:
   * $("#close-modal-button").on("click", function() {
   *   // Close the "Add to Cart" modal and reset its content.
   *   closeModal();
   * });
   *
   * // This function is typically used to close the modal and clear its content when a user dismisses it.
   */
  function closeModal() {
    // Hide the "Add to Cart" modal.
    addToCartModal.hide();

    // Reset input fields and remove error classes.
    addToCartModal.find("input[name=full_name]").removeClass("error").val("");
    addToCartModal.find("input[name=hotel]").val("");
    addToCartModal.find("input[name=rate_id]").val("");

    // Clear and hide any notes.
    addToCartModal.find("div[data-class=notes]").text("").hide();

    // Restore scrolling functionality to the body.
    document.body.classList.remove("noscroll");
  }

  /**
   * Log errors and debugging information.
   *
   * This function logs error messages and debugging information to the console. It is typically used for basic debugging
   * and error handling purposes. It accepts an 'err' parameter, which can be an error object or any debugging information,
   * and a 'type' parameter to specify the type of error or information being logged.
   *
   * @param {any} err - The error object or debugging information to be logged.
   * @param {string} type - The type or category of the error or information being logged.
   *
   * @example
   * // Example usage for logging an error:
   * var error = new Error("An error occurred!");
   * errorLog(error, "Error");
   *
   * // Example usage for logging debugging information:
   * var debugInfo = "Debugging information: This is a test.";
   * errorLog(debugInfo, "Debug");
   *
   * // This function is useful for logging errors and debugging information to the console.
   * // It helps in diagnosing and troubleshooting issues in the code.
   */
  var errorLog = function (err, type) {
    if (err) {
      console.log("----- " + type + " ---- \n");
      console.log(err);
      console.log("----- End " + type + " Log ---- \n");
    } else {
      console.log("Error is empty");
    }
  };

  /**
   * Filtering times based on a given range.
   *
   * This function takes an object containing API results and filters the times based on a specified range. It returns an
   * object with filtered times. The times are extracted from the 'apiResults' parameter and filtered based on the range
   * provided. The filtered times are then returned in a key-value format where the keys are the raw time values, and the
   * values are the formatted time strings.
   *
   * @param {Object} apiResults - An object containing API results, including a 'times' property.
   * @param {Array} apiResults.times - An array of time objects with 'raw' and 'formatted' properties.
   * @param {Array} range - An array representing the time range [startTime, endTime] for filtering.
   * @returns {Object} An object with filtered times where keys are raw time values and values are formatted time strings.
   *
   * @example
   * // Example usage:
   * var apiResults = {
   *   times: [
   *     { raw: "0800", formatted: "8:00 AM" },
   *     { raw: "1000", formatted: "10:00 AM" },
   *     { raw: "1200", formatted: "12:00 PM" },
   *     // ... other time objects ...
   *   ]
   * };
   * var range = ["0900", "1100"]; // Filter times between 9:00 AM and 11:00 AM.
   *
   * // Get filtered times within the specified range from the 'apiResults'.
   * var filteredTimes = checkTime(apiResults, range);
   *
   * // The 'filteredTimes' object will contain filtered times:
   * // { "1000": "10:00 AM", "1200": "12:00 PM" }
   *
   * // This function is useful for temporarily fixing and filtering times based on a specific range.
   */
  var checkTime = function (apiResults) {
    var apiTimes = apiResults.times;
    var times = {};
    var time = "";

    console.log("[checkTime] Range", range);
    console.log("[checkTime] API Times", apiTimes);
    for (var i = 0; i < apiTimes.length; i++) {
      time = apiTimes[i].raw;
      if (range[0] > time || range[1] < time) {
        continue;
      }
      times[time] = apiTimes[i].formatted;
    }
    return times;
  };

  /**
   * Get the current time in Hawaiian Standard Time (HST).
   *
   * This function calculates and returns the current time in Hawaiian Standard Time (HST) as a number. It accounts for the
   * time zone offset and returns the time in a 24-hour format.
   *
   * @returns {number} The current time in HST as a number (e.g., 1330 for 1:30 PM).
   *
   * @example
   * // Example usage:
   * // Get the current time in Hawaiian Standard Time (HST).
   * var currentTimeInHST = getHstTime();
   *
   * // 'currentTimeInHST' will contain the current time in HST, such as 1330 for 1:30 PM.
   *
   * // This function is useful for obtaining the current time in a specific time zone (HST in this case) for various
   * // applications, such as scheduling or time-sensitive operations.
   */
  var getHstTime = function () {
    var date = new Date();
    var mins = ("0" + date.getUTCMinutes()).slice(-2);
    var checkTime = date.getUTCHours() - 10;
    return checkTime < 0
      ? parseInt(24 + checkTime + mins)
      : parseInt(checkTime + mins);
  };

  /**
   * Builds select options for tee times based on the provided data.
   *
   * @param {string} selectListId - The ID of the select list to build options for.
   * @param {string} parentDivId - The ID of the parent <div> element where the select list will be appended.
   * @param {Object} timesData - The tee times data to populate the select list options.
   * @param {string} type - The type of operation, e.g., "dateChange".
   *
   * @example
   * // Usage example:
   * var selectListId = "teeTimesSelect";
   * var parentDivId = "teeTimesContainer";
   * var timesData = {
   *   900: "9:00 AM",
   *   930: "9:30 AM",
   *   // ... other tee times
   * };
   * var type = "dateChange";
   * buildTimesOptions(selectListId, parentDivId, timesData, type);
   * // This function will build select options for tee times and append them to the parent div.
   */
  var buildTimesOptions = function (
    selectListId,
    parentDivId,
    timesData,
    type
  ) {
    var selectOptions = $("#" + selectListId);
    var currentValue = "";
    var times = checkTime(timesData);
    var selectList = selectListWrapper(selectListId, parentDivId);
    var objectInfo = getObjectInfo(times);
    var hstTime = getHstTime();
    var datePicker = sameDateAsPicker();

    console.log("[buildTimesOptions] Times", times);
    console.log("[buildTimesOptions] selectListId", selectListId);
    console.log("[buildTimesOptions] type", type);

    // Get the current value of the select list
    if (type === "listChange") {
      currentValue = selectOptions.val();
      console.log(
        `[buildTimesOptions] Type: ${type}  Current value`,
        currentValue
      );
    }

    selectOptions.remove();

    for (var time in times) {
      time = parseInt(time);
      if (datePicker) {
        if (hstTime > time) {
          console.log("[buildTimesOptions] Skipping time", time, hstTime);
          continue;
        }
      }
      if (range[0] > time || range[1] <= time) {
        console.log("[buildTimesOptions] Skipping time", time, range);
        continue;
      }
      createOption(time, times[time], selectList, parseInt(currentValue));
    }

    var selectOptions2 = $("#" + selectListId);
    // Create options if there are tee times available, otherwise add "Not Available"
    if (
      datePicker &&
      checkOptions(selectOptions2) &&
      hstTime >= objectInfo[2]
    ) {
      createOption(objectInfo[2], times[objectInfo[2]], selectList, "");
      selectOptions2.attr("disabled", "disabled");
    } else if (!objectInfo[2]) {
      createOption("Not Available", "Not Available", selectList, "");
    }
  };

  /**
   * Checks if a given select list DOM element has any <option> elements.
   *
   * @param {jQuery} selectOptions - The jQuery DOM element representing the select list.
   * @returns {boolean} True if the select list is empty (has no options), otherwise false.
   *
   * @example
   * // Usage example:
   * var selectList = $("#mySelectList");
   * var isEmpty = checkOptions(selectList);
   * // The 'isEmpty' variable will be true if the select list has no <option> elements.
   */
  var checkOptions = function (selectOptions) {
    return selectOptions.has("option").length === 0;
  };

  /**
   * Compares today's date with the selected date from the datePicker.
   * Returns true if they represent the same date.
   *
   * @returns {boolean} True if today's date is the same as the selected date; otherwise, false.
   *
   * @example
   * // Usage example:
   * var isSameDate = sameDateAsPicker();
   * // The 'isSameDate' variable will be true if today's date matches the selected date.
   */
  function sameDateAsPicker() {
    var today = new Date();
    var datePicker = new Date(
      $("#avail-tee-times .datepicker").datepicker().val()
    );

    /**
     * Converts a date object into a string with the format "DD-MM-YYYY".
     *
     * @param {Date} date - The date to convert.
     * @returns {string} A string representation of the date in the "DD-MM-YYYY" format.
     */
    function dateToString(date) {
      return (
        date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear()
      );
    }

    // Compare today's date and the selected date from the datePicker
    return dateToString(today) === dateToString(datePicker);
  }

  /**
   * Retrieve information about an object, including the first key, loop length, and last key.
   *
   * This function takes an object as input and returns an array containing information about the object's keys.
   * The array includes the first key, loop length (number of keys), and the last key of the object.
   *
   * @param {Object} object - The object for which to retrieve information.
   * @returns {Array} An array containing information about the object in the format [firstKey, loopLength, lastKey].
   *
   * @example
   * // Example usage:
   * var myObject = {
   *   1: "One",
   *   2: "Two",
   *   3: "Three"
   * };
   *
   * // Get information about the object 'myObject'.
   * var objectInfo = getObjectInfo(myObject);
   *
   * // 'objectInfo' will contain information about the object:
   * // [1, 3, 3] - First key: 1, Loop length: 3, Last key: 3
   *
   * // This function is useful for obtaining key-related information about an object, which can be helpful
   * // when working with objects in JavaScript.
   */
  var getObjectInfo = function (object) {
    var keys = Object.keys(object);
    return [
      parseInt(keys[0]),
      +keys.length + +keys[0],
      parseInt(keys[keys.length - 1]),
    ];
  };

  /**
   * Create a wrapper for a select list and append it to a parent element.
   *
   * This function creates a `<select>` element with the specified `selectListId` and appends it to a parent `<div>` element
   * with the specified `parentDivId`. It returns the created `<select>` element for further customization if needed.
   *
   * @param {string} selectListId - The ID for the new `<select>` element.
   * @param {string} parentDivId - The ID of the parent `<div>` element to which the `<select>` element will be appended.
   * @returns {HTMLSelectElement} The created `<select>` element.
   *
   * @example
   * // Example usage:
   * var selectId = "mySelectList";
   * var parentDivId = "selectListContainer";
   *
   * // Create a wrapper for the select list and append it to the parent div.
   * var selectList = selectListWrapper(selectId, parentDivId);
   *
   * // Customize the select list as needed (e.g., add options, set attributes).
   * var option1 = document.createElement("option");
   * option1.text = "Option 1";
   * selectList.appendChild(option1);
   *
   * // This function is useful for dynamically creating and appending select lists to HTML elements.
   */
  var selectListWrapper = function (selectListId, parentDivId) {
    var myDiv = document.getElementById(parentDivId);
    var selectList = document.createElement("select");
    selectList.setAttribute("id", selectListId);
    selectList.setAttribute("name", selectListId);
    myDiv.appendChild(selectList);
    return selectList;
  };

  /**
   * Add an option to a select list with the specified value and text.
   *
   * This function creates an `<option>` element and appends it to a provided DOM element (`dom`) representing a select list.
   * It allows you to specify the `value` and `text` for the option. Additionally, if the `value` matches the `currentValue`,
   * the option is marked as selected.
   *
   * @param {string} value - The value to assign to the option element.
   * @param {string} text - The text content to display for the option.
   * @param {HTMLElement} dom - The DOM element (select list) to which the option will be added.
   * @param {string} currentValue - The value to compare with the 'value' parameter for marking the option as selected.
   *
   * @example
   * // Example usage:
   * // Assume you have an HTML select element with the ID "mySelectList" and a current value "selectedValue".
   *
   * var selectList = document.getElementById("mySelectList");
   * var selectedValue = "option2"; // Current selected value.
   *
   * // Add options to the select list using the 'createOption' function.
   * createOption("option1", "Option 1", selectList, selectedValue);
   * createOption("option2", "Option 2", selectList, selectedValue);
   * createOption("option3", "Option 3", selectList, selectedValue);
   *
   * // The options "Option 1", "Option 2", and "Option 3" will be added to the select list,
   * // and "Option 2" will be marked as selected if its value matches the 'selectedValue'.
   *
   * // This function is useful for dynamically adding options to select lists and setting the selected option.
   */
  var createOption = function (value, text = "", dom, currentValue) {
    // If text is empty, then don't add the option.
    if (text === "") {
      return;
    }

    var option = document.createElement("option");
    option.setAttribute("value", value);

    if (value === currentValue) {
      option.setAttribute("selected", "selected");
    }

    option.text = text;
    dom.appendChild(option);
  };

  /**
   * Adds event listeners to an array of select lists and/or a date picker to trigger tee time updates.
   *
   * @param {Array.<string>} selectListIds - An array of select list IDs to listen for changes.
   * @param {Array.<string>} datePickerClass - An array of date picker class names to listen for input and change events.
   *
   * @example
   * // Add event listeners to select lists with IDs "htt-players" and "htt-times,"
   * // and date pickers with class "sp-datepicker."
   * autoUpdateTeePrices(["htt-players", "htt-times"], ["sp-datepicker"]);
   */
  var autoUpdateTeePrices = function (selectListIds, datePickerClass) {
    // Add event listeners to select lists...
    if (selectListIds) {
      $(buildArrayOfElements(selectListIds, "#")).on("change", function () {
        loadTimes("listChange");
      });
    }

    // Add event listeners to date pickers...
    if (datePickerClass) {
      $(buildArrayOfElements(datePickerClass, "."))
        .datepicker()
        .on("input change", function (e) {
          loadTimes("dateChange");
        });
    }
  };

  /**
   * Builds a comma-separated string of elements based on their prefixes and an array of elements.
   *
   * @param {string[]} elements - An array of element identifiers (e.g., IDs or classes).
   * @param {string} elementType - The type of element (e.g., "id" or "class").
   * @returns {string} - A string containing comma-separated element identifiers.
   *
   * @example
   * // Usage example:
   * var elements = ["element1", "element2", "element3"];
   * var elementType = "id";
   * var elementString = buildArrayOfElements(elements, elementType);
   * // elementString will be "idelement1, idelement2, idelement3"
   */
  var buildArrayOfElements = function (elements, elementType) {
    var elementPrefix = "";
    for (var i = 0; i < elements.length; i++) {
      if (i === 0) {
        elementPrefix += elementType + elements[i];
      } else {
        elementPrefix += ", " + elementType + elements[i];
      }
    }
    return elementPrefix;
  };

  // Execute the following code when the document (HTML) is fully loaded and ready.
  $(document).ready(function () {
    // Configure date picker settings.
    datePickerConfig();

    // Load tee times when the document is ready, with the type "ready".
    loadTimes("ready");

    // Add auto-update functionality to select lists and date pickers:
    // - Listen for changes in select lists with IDs "htt-players" and "htt-times."
    // - Listen for input and change events in date pickers with class "sp-datepicker."
    autoUpdateTeePrices(["htt-players", "htt-times"], ["sp-datepicker"]);

    // Attach a scroll event handler to the body element.
    $("body").scroll(function () {
      // Hide the date picker associated with the element with ID "avail-tee-times."
      $("#avail-tee-times .datepicker").datepicker("hide");

      // Blur (unfocus) all input elements on the page.
      $("input").blur();

      // Trigger a click event on the element with the ID "search-teetimes."
      $("search-teetimes").click();
    });
  });
});
