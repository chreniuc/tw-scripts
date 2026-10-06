// ==UserScript==
// @name         Auto Launcher
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Schedules a command to be sent (or to arrive) at an exact time from the command confirmation page
// @author       NoTry?
// @match        https://*/game.php?*screen=place*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    // Only the command confirmation page has this form
    if ($("#command-data-form").length === 0) {
        return;
    }

    let launchTimeout;
    const submitButton = $("#troop_confirm_submit");
    const arrivalRow = $("#date_arrival");

    buildUi();

    function buildUi() {
        const authorUrl = TribalWars.buildURL("GET", "info_player", { id: 163648 });
        const credits = `<span class="float_right" style="position: absolute; right: 5px;padding: 3px">Creat de: <a href="${authorUrl}">NoTry?</a></span>`;

        arrivalRow.parents("table:first").attr("width", 500);
        arrivalRow.parent().after(`<tr>
            <td>Programeaza:</td>
            <td style="position: relative">
                <table><tbody>
                    <tr>
                        <td>Comanda:</td>
                        <td>
                            <input name="sa-mod" type="radio" value="arrival" checked="checked">Ajunge la
                            <input name="sa-mod" type="radio" value="launch">Se lanseaza la
                        </td>
                    </tr>
                    <tr>
                        <td>Data:</td>
                        <td><input name="sa-d" type="date" required="required"></td>
                    </tr>
                    <tr>
                        <td>Ora:</td>
                        <td><input name="sa-t-h" type="number" min="0" max="23" value="0" style="width: 40px" required="required">:<input name="sa-t-m" type="number" min="0" max="59" value="0" style="width: 40px" required="required">:<input name="sa-t-s" type="number" min="0" max="59" value="0" style="width: 40px" required="required">:<input name="sa-t-ms" type="number" min="0" max="999" value="0" style="width: 40px" required="required"></td>
                    </tr>
                    <tr><td>Lansare:</td><td id="sa-launch"></td></tr>
                    <tr><td>Ajunge:</td><td id="sa-arrival"></td></tr>
                    <tr><td>Intoarcere:</td><td id="sa-return"></td></tr>
                    <tr>
                        <td><button type="button" id="sa-save" class="btn float_left">Salveaza comanda</button>${credits}</td>
                    </tr>
                </tbody></table>
            </td>
        </tr>`);

        const now = new Date();
        $('input[name="sa-d"]').val(now.getFullYear() + "-" + Format.padLead(now.getMonth() + 1, 2) + "-" + Format.padLead(now.getDate(), 2));
        $('input[name="sa-t-h"]').val(Format.padLead(now.getHours(), 2));
        $('input[name="sa-t-m"]').val(Format.padLead(now.getMinutes(), 2));
        $('input[name="sa-t-s"]').val(Format.padLead(now.getSeconds(), 2));

        $("#sa-save").click(scheduleCommand);
    }

    function scheduleCommand() {
        if (!$("#command-data-form")[0].reportValidity()) {
            return;
        }

        const selected = getSelectedDate();
        const duration = getTravelDuration();
        const launch = isArrivalMode() ? new Date(selected.getTime() - duration) : selected;
        const arrival = isArrivalMode() ? selected : new Date(selected.getTime() + duration);
        // The return trip starts from the arrival time truncated to whole seconds
        const returning = new Date(Math.floor(arrival.getTime() / 1000) * 1000 + duration);

        if (launchTimeout) {
            clearTimeout(launchTimeout);
        }
        launchTimeout = setTimeout(function () {
            submitButton.click();
        }, launch.getTime() - getServerTime());

        $("#sa-launch").text(formatDate(launch));
        $("#sa-arrival").text(formatDate(arrival));
        $("#sa-return").text(formatDate(returning));
    }

    function getServerTime() {
        return Math.round(Timing.getCurrentServerTime());
    }

    /**
     * Travel time of the command, in milliseconds
     */
    function getTravelDuration() {
        return arrivalRow.find(".relative_time").data("duration") * 1000;
    }

    function getSelectedDate() {
        const date = new Date($('input[name="sa-d"]').val());
        date.setHours($('input[name="sa-t-h"]').val());
        date.setMinutes($('input[name="sa-t-m"]').val());
        date.setSeconds($('input[name="sa-t-s"]').val());
        date.setMilliseconds($('input[name="sa-t-ms"]').val());
        return date;
    }

    function isArrivalMode() {
        return $('input[name="sa-mod"]:checked').val() === "arrival";
    }

    function formatDate(date) {
        return Format.date(date / 1000, true) + ":" + Format.padLead(date.getUTCMilliseconds(), 3);
    }
})();
