CREATE TABLE comic (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v1(),
    author text,
    title text NOT null,
    tag text[],
    current_page integer,
    folder_id text
);