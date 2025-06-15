
export interface mcq_type {
    question : string,
    options : string[],
    answer : string
}
export interface communication {
    code : number,
    data : {
        room_id? : string,
        message? : string,
        userId? : string,
        topicDescription? : string,
        questionsCount? : number,
        username? : string,
        ques? : mcq_type,
        ans? : string
    }
}