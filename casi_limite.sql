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
    `mail` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    `psw` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
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



-- #################################################
-- # POPOLAMENTO DATI DI TEST
-- #################################################

-- 1) UTENTI: Docenti e Studenti
INSERT INTO Utente (mail, psw, nome, cognome, matricola, corso_laurea) VALUES
  -- Docenti
  ('docente1@uni.it', 'pswDocente1', 'Marco', 'Rossi', NULL, 'Docente'),
  ('docente2@uni.it', 'pswDocente2', 'Laura', 'Bianchi', NULL, 'Docente'),
  ('docente3@uni.it', 'pswDocente3', 'Pietro', 'Ferri', NULL, 'Docente'), -- Docente senza corsi

  -- Studenti
  ('studente1@uni.it', 'pswStud1', 'Alice', 'Verdi', 'S1001', 'Ingegneria Informatica'),
  ('studente2@uni.it', 'pswStud2', 'Luca', 'Neri', 'S1002', 'Matematica'),
  ('studente3@uni.it', 'pswStud3', 'Giulia', 'Russo', 'S1003', 'Fisica');   -- Studente senza iscrizioni

-- 2) CORSI
INSERT INTO Corso (nome, anno, id_prof) VALUES
  ('Analisi Matematica', 2025, 1),   -- corso con appelli
  ('Programmazione I',    2025, 1),   -- corso SENZA appelli (per il docente1)
  ('Fisica 1',            2025, 2),   -- corso con un appello
  ('Chimica Organica',    2024, 2);   -- corso SENZA appelli (anche per docente2)

-- 3) APPELLI
INSERT INTO Appello (id_corso, data) VALUES
  (1, '2025-06-15'),  -- Analisi Matematica
  (1, '2025-07-10'),  -- Analisi Matematica (seconda data)
  (3, '2025-06-20');  -- Fisica 1 (QUESTO resterà senza studenti iscritti)

-- 4) ISCRIZIONI AI CORSI
INSERT INTO Iscrizioni_Corsi (id_corso, id_studente) VALUES
  -- Alice Verdi (id 4) iscritta a corsi con e senza appello
  (1, 4),
  (2, 4),
  -- Luca Neri (id 5) iscrive solo ad Analisi Matematica
  (1, 5);
  -- Giulia Russo (id 6) NON ha iscrizioni: caso (4)

-- 5) ISCRIZIONI AGLI APPELLI
INSERT INTO Iscrizioni_Appello (id_corso, data, id_studente) VALUES
  -- Alice Verdi (id 4) e Luca Neri (id 5) a Analisi Matematica 2025-06-15
  (1, '2025-06-15', 4),
  (1, '2025-06-15', 5);
  -- L'appello di Fisica 1 (3, '2025-06-20') rimane SENZA iscritti (caso 3)

-- 6) (Opzionale) Verbalizzazione di un appello
-- INSERT INTO Verbale (data_verbale, ora_verbale, id_corso, data) VALUES
--   ('2025-06-16', CURRENT_TIMESTAMP, 1, '2025-06-15');
-- INSERT INTO Studenti_Verbale (id_verbale, id_studente) VALUES
--   (LAST_INSERT_ID(), 4),
--   (LAST_INSERT_ID(), 5);
