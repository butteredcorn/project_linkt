DROP TABLE IF EXISTS user_career_and_education;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS user_personality_aspects;
DROP TABLE IF EXISTS user_psychometrics;
DROP TABLE IF EXISTS photo_labels;
DROP TABLE IF EXISTS user_photos;
DROP TABLE IF EXISTS user_instagram;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    email                   VARCHAR(255) UNIQUE NOT NULL,
    password_hash           VARCHAR(255) NOT NULL,
    first_name              VARCHAR(255) NOT NULL,
    last_name               VARCHAR(255) NOT NULL,
    age                     INT NOT NULL,
    city_of_residence       VARCHAR(255),
    max_distance            INT,
    gender                  VARCHAR(255),     
    created_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_instagram (
    user_id                 INT PRIMARY KEY,
    instagram_id            VARCHAR(255) NOT NULL,
    access_token            VARCHAR(255) NOT NULL,
    instagram_username      VARCHAR(255),
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id)   REFERENCES users(id)
);

CREATE TABLE user_photos (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    instagram_post_id       BIGINT NOT NULL UNIQUE,
    user_id                 INT NOT NULL,
    photo_link              VARCHAR(255),
    photo_created_date      VARCHAR(255),
    caption                 VARCHAR(255),
    media_type              VARCHAR(255),
    video_thumbnail_url     VARCHAR(255),
    FOREIGN KEY (user_id)   REFERENCES users(id)
);

CREATE TABLE photo_labels (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    instagram_post_id       BIGINT,
    label                   VARCHAR(255),
    score                   FLOAT,
    FOREIGN KEY (instagram_post_id)  REFERENCES user_photos(instagram_post_id)
);

CREATE TABLE user_psychometrics (
    id                                          INT PRIMARY KEY AUTO_INCREMENT,
    user_id                                     INT NOT NULL,
    number_of_posts                             INT,
    number_of_captioned_posts                   INT,
    number_of_hashtags                          INT,
    mean_hashtags_per_post                      FLOAT,
    captioned_uncaptioned_ratio                 FLOAT,
    caption_careerfocused_words                 INT,
    caption_entertainment_words                 INT,
    caption_careerfocused_entertainment_ratio   FLOAT,
    posts_per_day_recent                        FLOAT,
    most_recent_post_date                       VARCHAR(255),
    oldest_post_date                            VARCHAR(255),
    mean_days_between_all_posts                 FLOAT,
    number_photos_annotated                     INT,
    number_portraits                            INT,
    number_noperson                             INT,
    portrait_to_noperson_ratio                  FLOAT,
    photo_careerfocused_words                   INT,
    photo_entertainment_words                   INT,
    photo_careerfocused_entertainment_ratio     FLOAT,
    number_photos_with_facial_expressions       INT,
    number_smiles                               INT,
    number_other_expressions                    INT,
    facial_expression_smile_other_ratio         FLOAT,
    created_at                                  TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id)                       REFERENCES users(id)
);

-- Openness to experience   (inventive/curious vs. consistent/cautious)
-- Conscientiousness        (efficient/organized vs. easy-going/careless)
-- Extroversion             (outgoing/energetic vs. solitary/reserved)
-- Agreeableness            (friendly/compassionate vs. challenging/detached)
-- Neuroticism              (sensitive/nervous vs. secure/confident)
CREATE TABLE user_personality_aspects (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    user_id                 INT NOT NULL,
    openess                 VARCHAR(255),
    conscientiousness       VARCHAR(255),
    extroversion            VARCHAR(255),
    agreeableness           VARCHAR(255),
    neuroticism             VARCHAR(255),
    FOREIGN KEY (user_id)   REFERENCES users(id)
);

CREATE TABLE user_preferences (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    user_id                 INT NOT NULL,
    partner_gender          VARCHAR(255),
    partner_age_min         INT,
    partner_age_max         INT,
    last_updated            TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id)   REFERENCES users(id)
);

CREATE TABLE user_career_and_education (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    user_id                 INT NOT NULL,
    highest_education_type  VARCHAR(255),
    education_field         VARCHAR(255),
    industry_type           VARCHAR(255),
    job_title               VARCHAR(255),
    income_range_low        INT,
    income_range_high       INT,
    last_updated            TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id)   REFERENCES users(id)
);