DROP TABLE IF EXISTS user_career_and_education;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS user_personality_aspects;
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

CREATE TABLE user_personality_aspects (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    user_id                 INT,
    mind                    VARCHAR(255),
    energy                  VARCHAR(255),
    nature                  VARCHAR(255),
    tactics                 VARCHAR(255),
    identtiy                VARCHAR(255),
    FOREIGN KEY (user_id)   REFERENCES users(id)
);

CREATE TABLE user_preferences (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    user_id                 INT,
    partner_gender          VARCHAR(255),
    partner_age_min         INT,
    partner_age_max         INT,
    last_updated            TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id)   REFERENCES users(id)
);

CREATE TABLE user_career_and_education (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    user_id                 INT,
    highest_education_type  VARCHAR(255),
    education_field         VARCHAR(255),
    industry_type           VARCHAR(255),
    job_title               VARCHAR(255),
    income_range_low        INT,
    income_range_high       INT,
    last_updated            TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id)   REFERENCES users(id)
);