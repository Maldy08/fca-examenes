export type QuestionType = 'multiple-choice' | 'open_text' | 'code_sql' | 'true_false';


export interface Option {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    content: string;
    type: QuestionType;
    options?: Option[]; // Only for multiple-choice questions
    
}