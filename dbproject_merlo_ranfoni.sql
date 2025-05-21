CREATE DATABASE IF NOT EXISTS `DBProject_Merlo_Ranfoni`
    /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_0900_ai_ci */
    /*!80016 DEFAULT ENCRYPTION='N' */;

USE `DBProject_Merlo_Ranfoni`;

-- DROP in ordine corretto per evitare errori di dipendenze
DROP TABLE IF EXISTS Iscrizioni_Corsi;
DROP TABLE IF EXISTS Iscrizioni_Appello;
DROP TABLE IF EXISTS Studenti_Verbale;
DROP TABLE IF EXISTS Verbale;
DROP TABLE IF EXISTS Appello;
DROP TABLE IF EXISTS Corso;
DROP TABLE IF EXISTS Utente;

DELIMITER $$ -- Il delimiter qui è stato inserito perchè c'è più di un " ; " che di default MySQL considera come il carattere di terminazione
-- VINCOLO: Ogni utente in corso sia docente
CREATE TRIGGER trg_check_docente
BEFORE INSERT ON Corso
FOR EACH ROW
BEGIN
    DECLARE tipo VARCHAR(45);
    SELECT corso_laurea INTO tipo FROM Utente WHERE id = NEW.id_prof;
    IF tipo <> 'Docente' THEN
        SIGNAL SQLSTATE '45000' -- Errore programmato dall'utente in mySQL
        SET MESSAGE_TEXT = 'L\'utente associato non è un docente';
    END IF;
END $$

$$
CREATE TRIGGER trg_check_Studente_Iscrizioni_Appello
BEFORE INSERT ON Iscrizioni_Appello
FOR EACH ROW
BEGIN
    DECLARE tipo VARCHAR(45);
    SELECT corso_laurea INTO tipo FROM Utente WHERE id = NEW.id_prof;
    IF tipo = 'Docente' THEN
        SIGNAL SQLSTATE '45000' -- Errore programmato dall'utente in mySQL
        SET MESSAGE_TEXT = 'L\'utente associato è un docente';
    END IF;
END $$

$$
CREATE TRIGGER trg_check_Studente_Iscrizioni_Corsi
BEFORE INSERT ON Iscrizioni_Corsi
FOR EACH ROW
BEGIN
    DECLARE tipo VARCHAR(45);
    SELECT corso_laurea INTO tipo FROM Utente WHERE id = NEW.id_prof;
    IF tipo = 'Docente' THEN
        SIGNAL SQLSTATE '45000' -- Errore programmato dall'utente in mySQL
        SET MESSAGE_TEXT = 'L\'utente associato è un docente';
    END IF;
END $$

DELIMITER ;

-- TABELLA: Utente
CREATE TABLE Utente (
    `id` INT NOT NULL AUTO_INCREMENT,
    `mail` VARCHAR(45) NOT NULL,
    `psw` VARCHAR(45) NOT NULL,
    `nome` VARCHAR(45) NOT NULL,
    `cognome` VARCHAR(45) NOT NULL,
    `matricola` VARCHAR(45) DEFAULT NULL,
    `corso_laurea` VARCHAR(45) DEFAULT 'Docente',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABELLA: Corso
CREATE TABLE Corso (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(45) NOT NULL,
    `anno` YEAR NOT NULL,
    `id_prof` INT NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT fk_corso_docente FOREIGN KEY (`id_prof`) REFERENCES Utente(`id`) ON UPDATE CASCADE ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABELLA: Appello
CREATE TABLE Appello (
    `id_corso` INT NOT NULL,
    `data` DATE NOT NULL,
    PRIMARY KEY (`id_corso`, `data`),
    CONSTRAINT fk_appello_corso FOREIGN KEY (`id_corso`) REFERENCES Corso(`id`) ON UPDATE CASCADE ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABELLA: Verbale
CREATE TABLE Verbale (
	`id` INT NOT NULL AUTO_INCREMENT,
    `data_verbale` DATE,
    `ora_verbale` TIMESTAMP,
	`id_corso` INT NOT NULL,
    `data` DATE NOT NULL,
	PRIMARY KEY (`id`),
	CONSTRAINT fk_verbale_appello FOREIGN KEY (`id_corso`, `data`) REFERENCES Appello(`id_corso`, `data`) ON UPDATE CASCADE ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABELLA: Studenti_Verbale
CREATE TABLE Studenti_Verbale (
	`id_verbale` INT NOT NULL,
	`id_studente` INT NOT NULL,
	PRIMARY KEY (`id_verbale`, `id_studente`),
	CONSTRAINT fk_stdverb_verb FOREIGN KEY (`id_verbale`) REFERENCES Verbale(`id`),
	CONSTRAINT fk_stdverb_studente FOREIGN KEY (`id_studente`) REFERENCES Utente(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABELLA: Iscrizioni_Appello
CREATE TABLE Iscrizioni_Appello (
    `id_corso` INT NOT NULL,
    `data` DATE NOT NULL,
    `id_studente` INT NOT NULL,
    `voto` ENUM('<vuoto>', 'assente', 'rimandato', 'riprovato', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '30 e lode') NOT NULL DEFAULT '<vuoto>',
    `stato` ENUM('non inserito', 'inserito', 'pubblicato', 'rifiutato', 'verbalizzato') NOT NULL DEFAULT 'non inserito',
    PRIMARY KEY (`id_corso`, `data`, `id_studente`),
    CONSTRAINT fk_iscr_appello FOREIGN KEY (`id_corso`, `data`) REFERENCES Appello(`id_corso`, `data`),
    CONSTRAINT fk_iscr_studente FOREIGN KEY (`id_studente`) REFERENCES Utente(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABELLA: Iscrizioni_Corsi
CREATE TABLE Iscrizioni_Corsi (
    `id_corso` INT NOT NULL,
    `id_studente` INT NOT NULL,
    PRIMARY KEY (`id_corso`, `id_studente`),
    CONSTRAINT fk_iscr_corso FOREIGN KEY (`id_corso`) REFERENCES Corso(`id`),
    CONSTRAINT fk_iscr_stud FOREIGN KEY (`id_studente`) REFERENCES Utente(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;





-- 👥 UTENTI: 1 docente + 2 studenti
INSERT INTO Utente (mail, psw, nome, cognome, matricola, corso_laurea)
VALUES 
('docente1@uni.it', 'pswDocente', 'Luca', 'Merlo', NULL, 'Docente'),       -- ID 1
('studente1@uni.it', 'pswStud1', 'Marco', 'Rossi', 'S123456', 'Informatica'), -- ID 2
('studente2@uni.it', 'pswStud2', 'Laura', 'Bianchi', 'S654321', 'Fisica');    -- ID 3

-- 📚 CORSO assegnato al docente (id_prof = 1)
INSERT INTO Corso (nome, anno, id_prof)
VALUES ('Basi di Dati', 2024, 1); -- ID 1

-- 📅 APPELLO del corso
INSERT INTO Appello (id_corso, data)
VALUES (1, '2024-06-15');

-- 📝 ISCRIZIONI al corso per gli studenti
INSERT INTO Iscrizioni_Corsi (id_corso, id_studente)
VALUES 
(1, 2),
(1, 3);

-- 1) Inserisco Mario Rossi
INSERT INTO Utente (mail, psw, nome, cognome, matricola, corso_laurea)
VALUES 
  ('mario.rossi@uni.it', 'pswStud3', 'Mario', 'Rossi', 'S789012', 'Informatica');

-- 2) Creo 4 nuovi corsi (id_prof = 1)
INSERT INTO Corso (nome, anno, id_prof) VALUES
  ('Algoritmi',          2024, 1),  -- id = 2
  ('Reti di Calcolatori',2024, 1),  -- id = 3
  ('SO - Sistemi Operativi',2024,1),-- id = 4
  ('Calcolo Numerico',    2024, 1);  -- id = 5

-- 3) Inserisco 4 appelli per ciascun corso
--    (id_verbale univoco, data_verbale 5 giorni dopo, ora alle 09:00)

-- Corso 2: Algoritmi
INSERT INTO Appello (id_corso, data) VALUES
  (2, '2024-07-01'),
  (2, '2024-09-10'),
  (2, '2024-11-20'),
  (2, '2025-01-15');

-- Corso 3: Reti di Calcolatori
INSERT INTO Appello (id_corso, data) VALUES
  (3, '2024-07-05'),
  (3, '2024-09-12'),
  (3, '2024-11-22'),
  (3, '2025-01-18');

-- Corso 4: Sistemi Operativi
INSERT INTO Appello (id_corso, data) VALUES
  (4, '2024-07-08'),
  (4, '2024-09-15'),
  (4, '2024-11-25'),
  (4, '2025-01-20');

-- Corso 5: Calcolo Numerico
INSERT INTO Appello (id_corso, data) VALUES
  (5, '2024-07-10'),
  (5, '2024-09-18'),
  (5, '2024-11-28'),
  (5, '2025-01-22');
  
  
  
  -- aggiunte per incrementare il db
  
  INSERT INTO Utente (mail, psw, nome, cognome, matricola, corso_laurea) VALUES
  ('docente2@uni.it', 'pswDoc2', 'Giulia',    'Verdi',    NULL, 'Docente'),
  ('docente3@uni.it', 'pswDoc3', 'Alessandro','Neri',     NULL, 'Docente'),
  ('docente4@uni.it', 'pswDoc4', 'Federica',  'Gialli',   NULL, 'Docente'),
  ('docente5@uni.it', 'pswDoc5', 'Davide',    'Azzurri',  NULL, 'Docente');

DELIMITER $$

DROP PROCEDURE IF EXISTS populate_students_courses$$
CREATE PROCEDURE populate_students_courses()
BEGIN
    DECLARE i       INT DEFAULT 1;
    DECLARE sid     INT;
    DECLARE email   VARCHAR(50);
    DECLARE nome    VARCHAR(30);
    DECLARE cognome VARCHAR(30);
    DECLARE matricola VARCHAR(10);
    DECLARE corso_laurea VARCHAR(20);

    WHILE i <= 50 DO
        -- compongo valori
        SET email        = CONCAT('studente', LPAD(i,2,'0'), '@uni.it');
        SET nome         = CONCAT('Stud', i);
        SET cognome      = CONCAT('Test',  i);
        SET matricola    = CONCAT('S', LPAD(100000 + i, 6, '0'));
        SET corso_laurea = ELT(
            ((i-1) MOD 5) + 1,
            'Informatica','Fisica','Matematica','Chimica','Ingegneria'
        );

        -- 1) inserisco lo studente
        INSERT INTO Utente(mail, psw, nome, cognome, matricola, corso_laurea)
        VALUES (
            email,
            CONCAT('psw', i),
            nome,
            cognome,
            matricola,
            corso_laurea
        );
        SET sid = LAST_INSERT_ID();

        -- 2) lo iscrivo a uno dei 5 corsi (10 studenti ciascuno)
        INSERT INTO Iscrizioni_Corsi(id_corso, id_studente)
        VALUES ( FLOOR((i-1)/10) + 1, sid );

        SET i = i + 1;
    END WHILE;
END$$

DELIMITER ;

CALL populate_students_courses();
DROP PROCEDURE populate_students_courses;

INSERT INTO Iscrizioni_Appello (id_corso, data, id_studente)
SELECT
  ic.id_corso,
  a.data,
  ic.id_studente
FROM Iscrizioni_Corsi ic
JOIN Appello a
  ON a.id_corso = ic.id_corso;

  
-- SELECT * FROM Utente;
-- SELECT * FROM Corso;
-- SELECT * FROM Appello;
-- SELECT * FROM Iscrizioni_Corsi;
-- SELECT * FROM Iscrizioni_Appello;

USE DBProject_Merlo_Ranfoni;
CREATE USER 'root'@'%' IDENTIFIED BY 'password';
CREATE USER 'root'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON miodb.* TO 'root'@'password';
FLUSH PRIVILEGES;
