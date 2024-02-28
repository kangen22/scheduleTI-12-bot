const queryText = `
SELECT 
    sch.id AS schedule_id,
    les.l_name AS lesson_name,
    dow.day AS day_of_week,
    wks.week AS week_number,
    tch.t_name AS teacher_name,
    tch.t_number AS teacher_number,
    tch.degree AS teacher_degree,
    tms.start_time,
    tms.end_time,
    fmt.format,
    fmt.mode
FROM 
    schedule_ti_12 sch
    INNER JOIN lessons les ON sch.lessons_id = les.id
    INNER JOIN days_of_week dow ON sch.day_id = dow.id
    INNER JOIN weeks wks ON sch.week_id = wks.id
    INNER JOIN teachers tch ON sch.teacher_id = tch.id
    INNER JOIN times tms ON sch.time_id = tms.id
    INNER JOIN formats fmt ON sch.format_id = fmt.id
WHERE 
    dow.day = $1 AND wks.week = $2;
`;

export default queryText;