import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailComponent } from './user-detail.component';
import { AuthService } from 'src/app/auth.service';
import { YtService } from 'src/app/yt.service';
import { Router } from '@angular/router';

fdescribe('UserDetailComponent', () => {
    let component: UserDetailComponent;
    let fixture: ComponentFixture<UserDetailComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UserDetailComponent],
            providers: [
                {
                    provide: AuthService,
                    useValue: undefined
                },
                {
                    provide: YtService,
                    useValue: undefined
                },
                {
                    provide: Router,
                    useValue: undefined
                }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('is created', () => {
        expect(component).toBeTruthy();
    });
});
