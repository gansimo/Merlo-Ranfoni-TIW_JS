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
    SELECT corso_laurea INTO tipo FROM Utente WHERE id = NEW.id_stud;
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
    SELECT corso_laurea INTO tipo FROM Utente WHERE id = NEW.id_stud;
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
-- # POPOLAMENTO DATI - SCENARIO DI UTILIZZO NORMALE
-- #################################################

-- 1) UTENTI: Docenti (10)
INSERT INTO Utente (mail, psw, nome, cognome, matricola, corso_laurea) VALUES
('docente1@uni.it', 'pswDocente1', 'Giovanni', 'Conti', NULL, 'Docente'),
('docente2@uni.it', 'pswDocente2', 'Paolo', 'Marino', NULL, 'Docente'),
('docente3@uni.it', 'pswDocente3', 'Elena', 'Fontana', NULL, 'Docente'),
('docente4@uni.it', 'pswDocente4', 'Francesco', 'Galli', NULL, 'Docente'),
('docente5@uni.it', 'pswDocente5', 'Chiara', 'Moretti', NULL, 'Docente'),
('docente6@uni.it', 'pswDocente6', 'Alessandro', 'Barbieri', NULL, 'Docente'),
('docente7@uni.it', 'pswDocente7', 'Simone', 'Rinaldi', NULL, 'Docente'),
('docente8@uni.it', 'pswDocente8', 'Valentina', 'Lombardi', NULL, 'Docente'),
('docente9@uni.it', 'pswDocente9', 'Davide', 'Greco', NULL, 'Docente'),
('docente10@uni.it', 'pswDocente10', 'Martina', 'Ricci', NULL, 'Docente');

-- 2) UTENTI: Studenti (40)
INSERT INTO Utente (mail, psw, nome, cognome, matricola, corso_laurea) VALUES
-- Gruppo Ingegneria Informatica (15 studenti)
('studente1@uni.it', 'pswStud1', 'Matteo', 'Rossi', 'S10001', 'Ingegneria Informatica'),
('studente2@uni.it', 'pswStud2', 'Andrea', 'Ferrari', 'S10002', 'Ingegneria Informatica'),
('studente3@uni.it', 'pswStud3', 'Lorenzo', 'Russo', 'S10003', 'Ingegneria Informatica'),
('studente4@uni.it', 'pswStud4', 'Sofia', 'Bianchi', 'S10004', 'Ingegneria Informatica'),
('studente5@uni.it', 'pswStud5', 'Alice', 'Romano', 'S10005', 'Ingegneria Informatica'),
('studente6@uni.it', 'pswStud6', 'Tommaso', 'Gallo', 'S10006', 'Ingegneria Informatica'),
('studente7@uni.it', 'pswStud7', 'Leonardo', 'Costa', 'S10007', 'Ingegneria Informatica'),
('studente8@uni.it', 'pswStud8', 'Giulia', 'Esposito', 'S10008', 'Ingegneria Informatica'),
('studente9@uni.it', 'pswStud9', 'Federico', 'Colombo', 'S10009', 'Ingegneria Informatica'),
('studente10@uni.it', 'pswStud10', 'Riccardo', 'Bruno', 'S10010', 'Ingegneria Informatica'),
('studente11@uni.it', 'pswStud11', 'Ginevra', 'Rizzi', 'S10011', 'Ingegneria Informatica'),
('studente12@uni.it', 'pswStud12', 'Edoardo', 'Villa', 'S10012', 'Ingegneria Informatica'),
('studente13@uni.it', 'pswStud13', 'Beatrice', 'Cattaneo', 'S10013', 'Ingegneria Informatica'),
('studente14@uni.it', 'pswStud14', 'Filippo', 'Martinelli', 'S10014', 'Ingegneria Informatica'),
('studente15@uni.it', 'pswStud15', 'Vittoria', 'Santoro', 'S10015', 'Ingegneria Informatica'),
-- Gruppo Economia e Commercio (15 studenti)
('studente16@uni.it', 'pswStud16', 'Marco', 'Marchetti', 'S20001', 'Economia e Commercio'),
('studente17@uni.it', 'pswStud17', 'Gabriele', 'Leone', 'S20002', 'Economia e Commercio'),
('studente18@uni.it', 'pswStud18', 'Camilla', 'Testa', 'S20003', 'Economia e Commercio'),
('studente19@uni.it', 'pswStud19', 'Pietro', 'D Amico', 'S20004', 'Economia e Commercio'),
('studente20@uni.it', 'pswStud20', 'Emma', 'Bernardi', 'S20005', 'Economia e Commercio'),
('studente21@uni.it', 'pswStud21', 'Diego', 'Longo', 'S20006', 'Economia e Commercio'),
('studente22@uni.it', 'pswStud22', 'Giorgia', 'Farina', 'S20007', 'Economia e Commercio'),
('studente23@uni.it', 'pswStud23', 'Cristian', 'Martini', 'S20008', 'Economia e Commercio'),
('studente24@uni.it', 'pswStud24', 'Anna', 'Serra', 'S20009', 'Economia e Commercio'),
('studente25@uni.it', 'pswStud25', 'Antonio', 'Palmieri', 'S20010', 'Economia e Commercio'),
('studente26@uni.it', 'pswStud26', 'Marta', 'Grassi', 'S20011', 'Economia e Commercio'),
('studente27@uni.it', 'pswStud27', 'Samuele', 'Gentile', 'S20012', 'Economia e Commercio'),
('studente28@uni.it', 'pswStud28', 'Sara', 'Pellegrini', 'S20013', 'Economia e Commercio'),
('studente29@uni.it', 'pswStud29', 'Luigi', 'Morelli', 'S20014', 'Economia e Commercio'),
('studente30@uni.it', 'pswStud30', 'Nicole', 'Ferri', 'S20015', 'Economia e Commercio'),
-- Gruppo Scienze Biologiche (10 studenti)
('studente31@uni.it', 'pswStud31', 'Christian', 'Bellini', 'S30001', 'Scienze Biologiche'),
('studente32@uni.it', 'pswStud32', 'Alessia', 'Barone', 'S30002', 'Scienze Biologiche'),
('studente33@uni.it', 'pswStud33', 'Daniele', 'Caruso', 'S30003', 'Scienze Biologiche'),
('studente34@uni.it', 'pswStud34', 'Elisa', 'Monti', 'S30004', 'Scienze Biologiche'),
('studente35@uni.it', 'pswStud35', 'Jacopo', 'Ferraro', 'S30005', 'Scienze Biologiche'),
('studente36@uni.it', 'pswStud36', 'Greta', 'Mariani', 'S30006', 'Scienze Biologiche'),
('studente37@uni.it', 'pswStud37', 'Simone', 'Sanna', 'S30007', 'Scienze Biologiche'),
('studente38@uni.it', 'pswStud38', 'Noemi', 'Basile', 'S30008', 'Scienze Biologiche'),
('studente39@uni.it', 'pswStud39', 'Davide', 'Pagano', 'S30009', 'Scienze Biologiche'),
('studente40@uni.it', 'pswStud40', 'Caterina', 'Gatti', 'S30010', 'Scienze Biologiche');

-- 3) CORSI (15)
INSERT INTO Corso (nome, anno, id_prof) VALUES
-- Corsi di Ingegneria
( 'Analisi Matematica I', 2025, 1),   -- ID 1
( 'Fisica Generale I', 2025, 2),      -- ID 2
( 'Fondamenti di Informatica', 2025, 3),-- ID 3
( 'Basi di Dati', 2025, 3),           -- ID 4
( 'Reti di Calcolatori', 2025, 4),    -- ID 5
-- Corsi di Economia
( 'Economia Politica', 2025, 5),      -- ID 6
( 'Diritto Privato', 2025, 6),        -- ID 7
( 'Economia Aziendale', 2025, 5),     -- ID 8
( 'Statistica', 2025, 7),             -- ID 9
( 'Marketing', 2025, 8),              -- ID 10
-- Corsi di Biologia
( 'Chimica Generale', 2025, 9),       -- ID 11
( 'Biologia Cellulare', 2025, 10),    -- ID 12
( 'Genetica', 2025, 10),              -- ID 13
( 'Fisiologia Vegetale', 2025, 9),    -- ID 14
-- Corso Inter-facoltà
( 'Lingua Inglese B2', 2025, 8);      -- ID 15

-- 4) APPELLI
INSERT INTO Appello (id_corso, data) VALUES
(1, '2025-06-20'), (1, '2025-07-15'), (1, '2025-09-05'),
(2, '2025-06-22'), (2, '2025-07-18'),
(3, '2025-06-25'), (3, '2025-07-20'), (3, '2026-01-20'),
(4, '2026-01-22'), (4, '2026-02-15'),
(5, '2026-01-25'), (5, '2026-02-18'),
(6, '2025-06-18'), (6, '2025-07-12'),
(7, '2025-06-19'), (7, '2025-09-10'),
(8, '2026-01-15'), (8, '2026-02-10'),
(9, '2026-01-18'), (9, '2026-02-12'),
(11, '2025-06-15'), (11, '2025-07-10'),
(12, '2025-06-17'), (12, '2025-09-08'),
(15, '2025-05-30'), (15, '2025-10-15');

-- 5) ISCRIZIONI AI CORSI
-- Si iscrivono gli studenti ai corsi del loro dipartimento
INSERT INTO Iscrizioni_Corsi (id_corso, id_studente)
SELECT C.id, U.id FROM Corso C, Utente U WHERE C.id IN (1,2,3,4,5,15) AND U.corso_laurea = 'Ingegneria Informatica'
UNION ALL
SELECT C.id, U.id FROM Corso C, Utente U WHERE C.id IN (6,7,8,9,10,15) AND U.corso_laurea = 'Economia e Commercio'
UNION ALL
SELECT C.id, U.id FROM Corso C, Utente U WHERE C.id IN (11,12,13,14,15) AND U.corso_laurea = 'Scienze Biologiche';

-- 6) ISCRIZIONI AGLI APPELLI (con voti e stati misti)
-- Popoliamo l'appello di Analisi Matematica I (1, '2025-06-20')
INSERT INTO Iscrizioni_Appello (id_corso, data, id_studente, voto, stato)
SELECT 1, '2025-06-20', id, '<vuoto>', 'non inserito' FROM Utente WHERE corso_laurea = 'Ingegneria Informatica' AND id <= 25;
UPDATE Iscrizioni_Appello SET voto='28', stato='pubblicato' WHERE id_corso=1 AND data='2025-06-20' AND id_studente BETWEEN 11 AND 13;
UPDATE Iscrizioni_Appello SET voto='24', stato='pubblicato' WHERE id_corso=1 AND data='2025-06-20' AND id_studente BETWEEN 14 AND 16;
UPDATE Iscrizioni_Appello SET voto='18', stato='pubblicato' WHERE id_corso=1 AND data='2025-06-20' AND id_studente=17;
UPDATE Iscrizioni_Appello SET voto='26', stato='rifiutato' WHERE id_corso=1 AND data='2025-06-20' AND id_studente=18;
UPDATE Iscrizioni_Appello SET voto='assente', stato='pubblicato' WHERE id_corso=1 AND data='2025-06-20' AND id_studente=19;

-- Popoliamo l'appello di Basi di Dati (4, '2026-01-22') che verrà verbalizzato
INSERT INTO Iscrizioni_Appello (id_corso, data, id_studente, voto, stato)
SELECT 4, '2026-01-22', id, '<vuoto>', 'non inserito' FROM Utente WHERE corso_laurea = 'Ingegneria Informatica' AND id <= 20;
UPDATE Iscrizioni_Appello SET voto='30', stato='verbalizzato' WHERE id_corso=4 AND data='2026-01-22' AND id_studente BETWEEN 11 AND 14;
UPDATE Iscrizioni_Appello SET voto='27', stato='verbalizzato' WHERE id_corso=4 AND data='2026-01-22' AND id_studente BETWEEN 15 AND 18;
UPDATE Iscrizioni_Appello SET voto='25', stato='verbalizzato' WHERE id_corso=4 AND data='2026-01-22' AND id_studente BETWEEN 19 AND 20;

-- Popoliamo l'appello di Economia Politica (6, '2025-06-18')
INSERT INTO Iscrizioni_Appello (id_corso, data, id_studente, voto, stato)
SELECT 6, '2025-06-18', id, '<vuoto>', 'non inserito' FROM Utente WHERE corso_laurea = 'Economia e Commercio' AND id <= 40;
UPDATE Iscrizioni_Appello SET voto='22', stato='pubblicato' WHERE id_corso=6 AND data='2025-06-18' AND id_studente BETWEEN 26 AND 30;
UPDATE Iscrizioni_Appello SET voto='30 e lode', stato='pubblicato' WHERE id_corso=6 AND data='2025-06-18' AND id_studente BETWEEN 31 AND 33;
UPDATE Iscrizioni_Appello SET voto='rimandato', stato='pubblicato' WHERE id_corso=6 AND data='2025-06-18' AND id_studente = 34;

-- Popoliamo l'appello di Chimica Generale (11, '2025-07-10')
INSERT INTO Iscrizioni_Appello (id_corso, data, id_studente, voto, stato)
SELECT 11, '2025-07-10', id, '<vuoto>', 'inserito' FROM Utente WHERE corso_laurea = 'Scienze Biologiche' AND id <= 50;
UPDATE Iscrizioni_Appello SET voto='21', stato='inserito' WHERE id_corso=11 AND data='2025-07-10' AND id_studente BETWEEN 41 AND 45;
UPDATE Iscrizioni_Appello SET voto='29', stato='inserito' WHERE id_corso=11 AND data='2025-07-10' AND id_studente BETWEEN 46 AND 50;

-- 7) VERBALI (esempio di un appello verbalizzato)
-- Creiamo il verbale per l'appello di Basi di Dati
INSERT INTO Verbale (data_verbale, ora_verbale, id_corso, data) VALUES ('2026-01-30', '2026-01-30 10:00:00', 4, '2026-01-22');
-- Inseriamo gli studenti che hanno accettato il voto in quel verbale
INSERT INTO Studenti_Verbale (id_verbale, id_studente)
SELECT LAST_INSERT_ID(), id_studente FROM Iscrizioni_Appello WHERE id_corso=4 AND data='2026-01-22' AND stato='verbalizzato';