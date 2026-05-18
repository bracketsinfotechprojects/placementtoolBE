import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, And } from 'typeorm';
import { AttendanceLog, AttendanceStatus, LeaveType } from '../../entities/attendance/attendance-log.entity';
import { AttendanceSummary, SummaryPeriod, SummaryStatus } from '../../entities/attendance/attendance-summary.entity';
import { AttendanceDeviation, DeviationType, DeviationSeverity } from '../../entities/attendance/attendance-deviation.entity';
import { CreateAttendanceLogDto } from './dto/create-attendance-log.dto';
import { UpdateAtt