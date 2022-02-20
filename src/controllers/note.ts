import { NextFunction, Request, Response, Router } from 'express';
import {
    ArchiveOrUnarchiveNoteRequest,
    CreateNoteRequest,
    DeleteNoteRequest,
    GetNotesRequest,
    Note,
    UpdateNoteRequest
} from 'src/entities/note';
import { INoteService } from './../services/note';

export class NoteController {
    private noteService: INoteService;

    private router: Router;

    constructor(noteService: INoteService) {
        this.noteService = noteService;

        this.router = Router();
        this.router.post(`/users/:user_id/notes`, this.createNote.bind(this));
        this.router.get(`/users/:user_id/notes`, this.getNotes.bind(this));
        this.router.put(`/users/:user_id/notes/:note_id`, this.updateNote.bind(this));
        this.router.delete(`/users/:user_id/notes/:note_id`, this.deleteNote.bind(this));
        this.router.put(`/users/:user_id/notes/:note_id/archive`, this.archiveOrUnarchiveNote.bind(this));
    }

    getRouter() {
        return this.router;
    }

    async createNote(req: Request, res: Response, next: NextFunction) {
        try {
            const createNoteRequest: CreateNoteRequest = req.body;

            const createNoteResponse = await this.noteService.createNote(req.params.user_id, createNoteRequest);

            res.status(201).json(createNoteResponse);
        } catch (err) {
            next(err);
        }
    }

    async getNotes(req: Request, res: Response, next: NextFunction) {
        try {
            const getNotesRequest: GetNotesRequest = {
                user_id: req.params.user_id
            };

            if (typeof req.query.is_archived === 'boolean') {
                getNotesRequest.is_archived = req.query.is_archived;
            }

            if (typeof req.query.limit === 'number') {
                getNotesRequest.limit = req.query.limit;
            }

            const getNotesResponse = await this.noteService.getNotes(getNotesRequest);

            res.status(200).json(getNotesResponse);
        } catch (err) {
            next(err);
        }
    }

    async updateNote(req: Request, res: Response, next: NextFunction) {
        try {
            const updateNoteRequest: UpdateNoteRequest = {
                user_id: req.params.user_id,
                id: req.params.note_id
            };

            if (req.body.title) {
                updateNoteRequest.title = req.body.title;
            }

            if (req.body.content) {
                updateNoteRequest.content = req.body.content;
            }

            const updateNoteResponse = await this.noteService.updateNote(updateNoteRequest);

            res.status(200).json(updateNoteResponse);
        } catch (err) {
            next(err);
        }
    }

    async deleteNote(req: Request, res: Response, next: NextFunction) {
        try {
            const deleteNoteRequest: DeleteNoteRequest = {
                user_id: req.params.user_id,
                id: req.params.note_id
            };

            const deleteNoteResponse = await this.noteService.deleteNote(deleteNoteRequest);

            res.status(200).json(deleteNoteResponse);
        } catch (err) {
            next(err);
        }
    }

    async archiveOrUnarchiveNote(req: Request, res: Response, next: NextFunction) {
        try {
            const archiveOrUnarchiveNoteRequest: ArchiveOrUnarchiveNoteRequest = {
                user_id: req.params.user_id,
                id: req.params.note_id,
                should_archive: req.body.should_archive
            };

            const response = await this.noteService.archiveOrUnarchiveNote(archiveOrUnarchiveNoteRequest);

            res.status(200).json(response);
        } catch (err) {
            next(err);
        }
    }
}
