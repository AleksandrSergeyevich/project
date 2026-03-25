function dtime_nums(add_days) {
    let date = change_day_count(add_days);
    date.setDate(date.getDate() + 1);

    const currentDay = date.getDate();
    const daysText = (currentDay < 10 ? "0" : "") + currentDay;

    const currentMonth = date.getMonth() + 1;
    const monthText = (currentMonth < 10 ? "0" : "") + currentMonth;

    document.write(daysText + "." + monthText + "." + date.getFullYear())
}

function change_day_count(add_days) {
    let date = new Date();
    const newDays = date.getDate() + add_days;
    date.setDate(newDays);
    return date
}