import {
	Component,
	ChangeDetectionStrategy,
	ViewChild,
	TemplateRef, OnInit, ViewEncapsulation,
} from '@angular/core';
import {
	isSameMonth,
	isSameDay,
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	startOfDay,
	endOfDay,
	format, addHours, addDays, addMinutes,
} from 'date-fns';
import {Observable, Subject} from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
	CalendarEvent,
	CalendarEventAction,
	CalendarEventTimesChangedEvent,
	CalendarView,
} from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import {HttpClient, HttpParams} from "@angular/common/http";
import {map} from "rxjs/operators";
import {OperationService} from "../../../../services/call-center/operation.service";
import {OperationModel} from "../../../../models/call-center/operation.model";
import {RedirectService} from "../../../../services/redirect.service";
import {TypesUtilsService} from "../../../../core/_base/crud";
import {MatDialog} from "@angular/material/dialog";
import {AjouterModifierOperationComponent} from "../operation/ajouter-modifier-operation/ajouter-modifier-operation.component";

const colors: Record<string, EventColor> = {
	red: {
		primary: '#ad2121',
		secondary: '#FAE3E3',
	},
	blue: {
		primary: '#1e90ff',
		secondary: '#D1E8FF',
	},
	yellow: {
		primary: '#e3bc08',
		secondary: '#FDF1BA',
	},
};

interface Film {
	id: number;
	title: string;
	release_date: string;
}

function getTimezoneOffsetString(date: Date): string {
	const timezoneOffset = date.getTimezoneOffset();
	const hoursOffset = String(
		Math.floor(Math.abs(timezoneOffset / 60))
	).padStart(2, '0');
	const minutesOffset = String(Math.abs(timezoneOffset % 60)).padEnd(2, '0');
	const direction = timezoneOffset > 0 ? '-' : '+';

	return `T00:00:00${direction}${hoursOffset}:${minutesOffset}`;
}

@Component({
  selector: 'digitalUP-calendar-event',
	encapsulation: ViewEncapsulation.None,
  templateUrl: './calendar-event.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: [
		`
			h3 {
        margin: 0 0 10px;
      }

      pre {
        background-color: #f5f5f5;
        padding: 15px;
      }
    `,
	],
})
export class CalendarEventComponent implements OnInit {

	@ViewChild('modalContent', {static: true}) modalContent: TemplateRef<any>;
	@ViewChild('fiche', {static: true}) fiche: TemplateRef<any>;

	view: CalendarView = CalendarView.Month;

	CalendarView = CalendarView;

	viewDate: Date = new Date();

	events$: Observable<CalendarEvent<{ film: any }>[]>;

	actions: CalendarEventAction[] = [
		{
			label: '<i class="fas fa-fw fa-eye"></i>',
			a11yLabel: 'Fiche',
			cssClass : 'color: #eaeaea',
			onClick: ({event}: { event: CalendarEvent }): void => {
				//this.events = this.events.filter((iEvent) => iEvent !== event);
				this.Fiche = event.meta.Fiche
				this.handleEvent('Détails Fiche', event, this.fiche);
			},
		},
		{
			label: '<i class="fas fa-fw fa-pencil-alt"></i>',
			a11yLabel: 'Edit',
			cssClass : 'color: #ffb822',
			onClick: ({event}: { event: CalendarEvent }): void => {
				this.modifier(event.meta)
			},
		},

	];

	constructor(
		private http: HttpClient,
		private operationService: OperationService,
		private modal: NgbModal,
		private modalService: NgbModal,
		private dialog: MatDialog,
	) {
	}

	ngOnInit(): void {
		this.fetchEvents();
	}

	fetchEvents(): void {
		const getStart: any = {
			month: startOfMonth,
			week: startOfWeek,
			day: startOfDay,
		}[this.view];

		const getEnd: any = {
			month: endOfMonth,
			week: endOfWeek,
			day: endOfDay,
		}[this.view];

		//.set('api_key', '0ec33936a68018857d727958dca1424f');
		let q = `date[after]=${format(getStart(this.viewDate), 'yyyy-MM-dd')}&
				date[before]=${format(addDays(getEnd(this.viewDate), 1), 'yyyy-MM-dd')}
				&type=1&pagination=false`;
		this.events$ = this.operationService.getOperations(q)
			/*this.http
			.get('https://api.themoviedb.org/3/discover/movie', { params })*/
			.pipe(
				map((results) => {
					return results['hydra:member'].map((film: OperationModel) => {
						return {
							title: film.Etat.nom + ' | ' + film.Fiche.nomPre + ' N° tel 1 : ' + film.Fiche.tel1 + ' N° tel 2 : ' + film.Fiche.tel2,
							start: new Date(film.date),
							end: addMinutes(new Date(film.date), 30),
							//start: this.typesUtilsService.getDateStringFromDateTime(film.date),
							/*new Date(
								film.date + getTimezoneOffsetString(this.viewDate)
							)*/
							//end: this.typesUtilsService.getDateStringFromDateTime(addHours(film.date, 1)),
							color: {
								primary: film.Etat.color,
								secondary: film.Etat.color + '50',
							},//colors.yellow,
							allDay: false,
							meta: film,
							actions: this.actions,
							draggable: true,
						};
					});
				})
			);
		console.log(startOfDay(new Date()), 2)
	}

	dayClicked({
				   date,
				   events,
			   }: {
		date: Date;
		events: CalendarEvent<{ film: Film }>[];
	}): void {
		if (isSameMonth(date, this.viewDate)) {
			if (
				(isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
				events.length === 0
			) {
				this.activeDayIsOpen = false;
			} else {
				this.activeDayIsOpen = true;
				this.viewDate = date;
			}
		}
	}

	eventClicked(event: CalendarEvent<{ film: Film }>): void {
		window.open(
			`https://www.themoviedb.org/movie/${event.meta.film.id}`,
			'_blank'
		);
	}

	modalData: {
		action: string;
		event: CalendarEvent;
	};
	/*

	*/
	refresh = new Subject<void>();
	/*
		events: CalendarEvent[] = [
			{
				start: subDays(startOfDay(new Date()), 6),
				end: addDays(new Date(), 0),
				title: 'A 7 year event',
				color: { ...colors.blue },
				actions: this.actions,
				allDay: true,
				resizable: {
					beforeStart: true,
					afterEnd: true,
				},
				draggable: true,
			},
			{
				start: startOfDay(new Date()),
				title: 'An event with yes end date',
				color: { ...colors.yellow },
				actions: this.actions,
			},
			{
				start: subDays(endOfMonth(new Date()), 3),
				end: addDays(endOfMonth(new Date()), 3),
				title: 'A long event that spans 20000 months',
				color: { ...colors.blue },
				allDay: true,
			},
			{
				start: addHours(startOfDay(new Date()), 2),
				end: addHours(new Date(), 2),
				title: 'A draggable and resizable Rendez-vous',
				color: { ...colors.red },
				actions: this.actions,
				resizable: {
					beforeStart: true,
					afterEnd: true,
				},
				draggable: true,
			},
		];
	*/
	activeDayIsOpen: boolean = true;

	//constructor(private modal: NgbModal) {console.log(this.events)}
	/*
		dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
			if (isSameMonth(date, this.viewDate)) {
				if (
					(isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
					events.length === 0
				) {
					this.activeDayIsOpen = false;
				} else {
					this.activeDayIsOpen = true;
				}
				this.viewDate = date;
			}
		}
	*/
	handleEvent(action: string, event: CalendarEvent, modal): void {
		let w: any = {size: 'xl'};
		if (window.innerWidth < 1000) {
			w = {size: 'lg', windowClass: 'modal-xl'}
		}
		//return this.modalService.open(modale, w);

		//this.modalData = { event, action };
		this.modal.open(modal, w);
	}

		eventTimesChanged({
							  event,
							  newStart,
							  newEnd,
						  }: CalendarEventTimesChangedEvent): void {

		let op : OperationModel = event.meta;
		//console.log(newStart, op)
		op.id = null;
		this.modifier(event.meta, newStart)
			/*this.events$ = this.events$.map((iEvent) => {
				if (iEvent === event) {
					return {
						...event,
						start: newStart,
						end: newEnd,
					};
				}
				return iEvent;
			});*/
			//this.handleEvent('Dropped or resized', event);
			//console.log(event, this.events, newStart, newEnd)
		}
/*
		handleEvent(action: string, event: CalendarEvent): void {
			this.modalData = { event, action };
			this.modal.open(this.modalContent, { size: 'lg' });
		}

		addEvent(): void {
			this.events = [
				...this.events,
				{
					title: 'New event',
					start: startOfDay(new Date()),
					end: endOfDay(new Date()),
					color: colors.red,
					draggable: true,
					resizable: {
						beforeStart: true,
						afterEnd: true,
					},
				},
			];
		}
	*/
	deleteEvent(eventToDelete: CalendarEvent) {
		//this.events = this.events.filter((event) => event !== eventToDelete);
	}

	setView(view: CalendarView) {
		this.view = view;
	}

	closeOpenMonthViewDay() {
		this.activeDayIsOpen = false;
	}

	Fiche = null;
	modifier(op : OperationModel = null, newDate = null) {
		return this.dialog.open(AjouterModifierOperationComponent, {
			data: {
				fiche: op.Fiche,
				operation: op == null ? new OperationModel() : op,
				type: 1,
				nom: 'rendez-vous',
				newDate: newDate
			},
			width: '1000px'
		}).afterClosed().subscribe(value => {
		});
	}
}
