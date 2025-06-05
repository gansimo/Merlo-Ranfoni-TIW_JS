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

DELIMITER $$

-- VINCOLO: Ogni utente in corso sia docente
CREATE TRIGGER trg_check_docente
BEFORE INSERT ON Corso
FOR EACH ROW
BEGIN
    DECLARE tipo VARCHAR(45);
    SELECT corso_laurea INTO tipo FROM Utente WHERE id = NEW.id_prof;
    IF tipo <> 'Docente' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'L\'utente associato non è un docente';
    END IF;
END $$

-- VINCOLO: Controlla che chi si iscrive a un appello sia uno studente
CREATE TRIGGER trg_check_Studente_Iscrizioni_Appello
BEFORE INSERT ON Iscrizioni_Appello
FOR EACH ROW
BEGIN
    DECLARE tipo VARCHAR(45);
    -- NOTA: Corretto potenziale refuso, dovrebbe essere NEW.id_studente
    SELECT corso_laurea INTO tipo FROM Utente WHERE id = NEW.id_studente;
    IF tipo = 'Docente' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'L\'utente associato è un docente e non può iscriversi a un appello';
    END IF;
END $$

-- VINCOLO: Controlla che chi si iscrive a un corso sia uno studente
CREATE TRIGGER trg_check_Studente_Iscrizioni_Corsi
BEFORE INSERT ON Iscrizioni_Corsi
FOR EACH ROW
BEGIN
    DECLARE tipo VARCHAR(45);
    -- NOTA: Corretto potenziale refuso, dovrebbe essere NEW.id_studente
    SELECT corso_laurea INTO tipo FROM Utente WHERE id = NEW.id_studente;
    IF tipo = 'Docente' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'L\'utente associato è un docente e non può iscriversi a un corso';
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
-- # POPOLAMENTO DATI DI TEST (CON ESTENSIONI PER TEST NON AUTORIZZATI)
-- #################################################

-- 1) UTENTI: Docenti e Studenti
INSERT INTO Utente (mail, psw, nome, cognome, matricola, corso_laurea) VALUES
  -- Docenti (ID AUTO_INCREMENT: 1, 2, 3)
  ('docente1@uni.it', 'pswDocente1', 'Marco', 'Rossi', NULL, 'Docente'),         -- ID 1 (docente titolare di corsi)
  ('docente2@uni.it', 'pswDocente2', 'Laura', 'Bianchi', NULL, 'Docente'),       -- ID 2 (docente titolare di altri corsi, per testare accessi incrociati)
  ('docente3@uni.it', 'pswDocente3', 'Pietro', 'Ferri', NULL, 'Docente'),        -- ID 3 (Docente SENZA corsi - caso limite)

  -- Studenti (ID AUTO_INCREMENT: 4, 5, 6)
  ('studente1@uni.it', 'pswStud1', 'Alice', 'Verdi', 'S1001', 'Ingegneria Informatica'), -- ID 4
  ('studente2@uni.it', 'pswStud2', 'Luca', 'Neri', 'S1002', 'Matematica'),               -- ID 5
  ('studente3@uni.it', 'pswStud3', 'Giulia', 'Russo', 'S1003', 'Fisica'),                -- ID 6 (Studente NON ISCRITTO a nessun corso/appello - caso limite e per test non autorizzati)
  -- NUOVI STUDENTI per popolare più appelli e scenari (ID AUTO_INCREMENT: 7, 8)
  ('studente4@uni.it', 'pswStud4', 'Matteo', 'Bruno', 'S1004', 'Ingegneria Gestionale'), -- ID 7
  ('studente5@uni.it', 'pswStud5', 'Sofia', 'Gallo', 'S1005', 'Economia');              -- ID 8

-- 2) CORSI
INSERT INTO Corso (nome, anno, id_prof) VALUES
  -- Corsi del docente1 (ID 1) (ID AUTO_INCREMENT: 1, 2)
  ('Analisi Matematica', 2025, 1),   -- ID 1: corso con appelli, per docente1
  ('Programmazione I',    2025, 1),   -- ID 2: corso con un appello (verrà aggiunto), per docente1

  -- Corsi del docente2 (ID 2) (ID AUTO_INCREMENT: 3, 4)
  ('Fisica 1',            2025, 2),   -- ID 3: corso con un appello, per docente2
  ('Chimica Organica',    2024, 2);   -- ID 4: corso SENZA appelli, per docente2 (caso limite)
  -- docente3 (ID 3) non ha corsi (caso limite)

-- 3) APPELLI
INSERT INTO Appello (id_corso, data) VALUES
  -- Appelli per Analisi Matematica (ID Corso 1)
  (1, '2025-06-15'),
  (1, '2025-07-10'),

  -- Appello per Fisica 1 (ID Corso 3)
  (3, '2025-06-20'), -- Questo appello avrà studenti iscritti

  -- NUOVO APPELLO per Programmazione I (ID Corso 2)
  (2, '2025-07-01'); -- Per avere un appello anche per Programmazione I

-- 4) ISCRIZIONI AI CORSI
INSERT INTO Iscrizioni_Corsi (id_corso, id_studente) VALUES
  -- Alice Verdi (ID 4)
  (1, 4), -- Iscritta a Analisi Matematica (docente1)
  (2, 4), -- Iscritta a Programmazione I (docente1)
  (3, 4), -- NUOVA: Alice (ID 4) iscritta a Fisica 1 (docente2). Per testare studente iscritta a corso ma non a un suo specifico appello.

  -- Luca Neri (ID 5)
  (1, 5), -- Iscritto solo ad Analisi Matematica (docente1)

  -- Giulia Russo (ID 6) NON ha iscrizioni a corsi (caso limite e per test non autorizzati)

  -- Matteo Bruno (ID 7) - NUOVO STUDENTE
  (1, 7), -- Iscritto a Analisi Matematica (docente1)
  (3, 7), -- Iscritto a Fisica 1 (docente2)

  -- Sofia Gallo (ID 8) - NUOVO STUDENTE
  (2, 8), -- Iscritta a Programmazione I (docente1)
  (4, 8); -- Iscritta a Chimica Organica (docente2) - corso senza appelli (caso limite: studente iscritta a corso senza appelli)

-- 5) ISCRIZIONI AGLI APPELLI
INSERT INTO Iscrizioni_Appello (id_corso, data, id_studente, voto, stato) VALUES
  -- Studenti iscritti ad Analisi Matematica (ID Corso 1), appello del 2025-06-15
  (1, '2025-06-15', 4, '28', 'pubblicato'),  -- Alice Verdi (ID 4)
  (1, '2025-06-15', 5, '25', 'pubblicato'),  -- Luca Neri (ID 5)
  (1, '2025-06-15', 7, '<vuoto>', 'non inserito'), -- Matteo Bruno (ID 7) - NUOVA ISCRIZIONE per popolare l'appello

  -- Alice Verdi (ID 4) iscritta al secondo appello di Analisi Matematica (ID Corso 1)
  (1, '2025-07-10', 4, '<vuoto>', 'non inserito'), -- Per testare studente con più iscrizioni ad appelli dello stesso corso

  -- Matteo Bruno (ID 7) iscritto all'appello di Fisica 1 (ID Corso 3), appello del 2025-06-20
  (3, '2025-06-20', 7, '30', 'inserito'), -- Questo popola l'appello di Fisica 1.
                                          -- Alice (ID 4) è iscritta al corso Fisica 1 (ID 3) MA NON a questo appello, utile per test.

  -- Sofia Gallo (ID 8) iscritta all'appello di Programmazione I (ID Corso 2), appello del 2025-07-01
  (2, '2025-07-01', 8, '<vuoto>', 'non inserito'); -- Alice (ID 4) è iscritta al corso Programmazione I (ID 2) MA NON a questo appello.

  -- L'appello di Chimica Organica (ID Corso 4) non esiste, quindi nessuno studente può esservi iscritto.
  -- Giulia Russo (ID 6) non è iscritta a nessun appello.

-- 6) (Opzionale) Verbalizzazione di un appello (esempio, se necessario)
-- INSERT INTO Verbale (data_verbale, ora_verbale, id_corso, data) VALUES
--   ('2025-06-16', CURRENT_TIMESTAMP, 1, '2025-06-15');
-- SET @last_verbale_id = LAST_INSERT_ID();
-- INSERT INTO Studenti_Verbale (id_verbale, id_studente) VALUES
--   (@last_verbale_id, 4),
--   (@last_verbale_id, 5);