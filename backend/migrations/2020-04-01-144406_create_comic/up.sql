CREATE TABLE comic (
    id SERIAL PRIMARY KEY,
    author text,
    title text NOT null,
    thumbnail text,
    pdf text,
    tag text[],
    current_page integer,
    folder_id text
);